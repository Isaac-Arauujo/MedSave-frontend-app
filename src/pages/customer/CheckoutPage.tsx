import { zodResolver } from '@hookform/resolvers/zod';
import { differenceInSeconds, parseISO } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AddressFormModal } from '../../components/shared/AddressFormModal';
import { DeliveryOptionCard } from '../../components/shared/DeliveryOptionCard';
import { PrescriptionUploadCard } from '../../components/shared/PrescriptionUploadCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/PageLoader';
import { Spinner } from '../../components/ui/Spinner';
import {
  getDeliveryTypeLabel,
  getPaymentMethodLabel,
  PAYMENT_METHOD_OPTIONS,
} from '../../constants/checkoutOptions';
import { ROUTES } from '../../constants/routes';
import { useAddresses } from '../../hooks/useAddresses';
import { useCart } from '../../hooks/useCart';
import { useCheckout } from '../../hooks/useCheckout';
import { useProfile } from '../../hooks/useProfile';
import type { CheckoutStep, PaymentMethod, UpdatePickupPersonRequest } from '../../types/CheckoutTypes';
import type { ParsedOrderCreationError } from '../../types/OrderTypes';
import type { CreateAddressRequest } from '../../types/AddressTypes';
import { formatAddressLine, formatCartPharmacyLine } from '../../utils/formatAddress';
import { formatCpf } from '../../utils/formatCpf';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  cartHasBlockingPrescriptions,
  cartHasOnlineSaleBlocked,
  cartBlocksDeliveryForPrescription,
  cartRequiresPickupForPrescription,
  getPrescriptionItems,
  ONLINE_SALE_BLOCKED_MESSAGE,
  ORIGINAL_PRESCRIPTION_PICKUP_MESSAGE,
} from '../../utils/prescriptionUtils';

const thirdPartyPickupSchema = z.object({
  pickupPersonName: z.string().min(1, 'Nome é obrigatório'),
  pickupPersonCpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .transform((value) => value.replace(/\D/g, ''))
    .pipe(z.string().length(11, 'CPF deve conter 11 dígitos')),
  pickupPersonPhone: z.string().optional(),
});

type ThirdPartyPickupFormData = z.input<typeof thirdPartyPickupSchema>;

const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: 'delivery', label: 'Entrega' },
  { key: 'payment', label: 'Pagamento' },
  { key: 'review', label: 'Revisão' },
];

const StepIndicator = ({ currentStep }: { currentStep: CheckoutStep }) => {
  const currentIndex = STEPS.findIndex((step) => step.key === currentStep);

  return (
    <ol className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {STEPS.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = index < currentIndex;

        return (
          <li
            key={step.key}
            className="flex flex-1 items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3"
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                isActive || isCompleted
                  ? 'bg-primary text-white'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {index + 1}
            </span>
            <span className={`font-medium ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, fetchCart, removeItem } = useCart();
  const { profile } = useProfile();
  const { addresses, isLoading: isAddressesLoading, createAddress, refetch: refetchAddresses } =
    useAddresses();
  const {
    session,
    currentStep,
    selectedDeliveryType,
    selectedFreight,
    isLoading,
    isSubmitting,
    isFreightLoading,
    error,
    freightError,
    deliveryOptions,
    initializeSession,
    calculateAllDeliveryOptions,
    selectDeliveryOption,
    submitDelivery,
    submitPayment,
    placeOrder,
    goToStep,
    clearSession,
  } = useCheckout();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isThirdPartyPickup, setIsThirdPartyPickup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [expiredModalOpen, setExpiredModalOpen] = useState(false);
  const [isAddressSubmitting, setIsAddressSubmitting] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null);

  const {
    register,
    getValues,
    trigger,
    formState: { errors: pickupErrors },
  } = useForm<ThirdPartyPickupFormData>({
    resolver: zodResolver(thirdPartyPickupSchema),
    defaultValues: {
      pickupPersonName: '',
      pickupPersonCpf: '',
      pickupPersonPhone: '',
    },
  });

  const checkoutBootstrappedRef = useRef(false);

  useEffect(() => {
    if (checkoutBootstrappedRef.current) {
      return;
    }
    checkoutBootstrappedRef.current = true;
    void initializeSession().catch(() => {
      // Erro tratado no hook (estado error).
    });
    void fetchCart();
  }, [initializeSession, fetchCart]);

  useEffect(() => {
    if (session?.paymentMethod) {
      setPaymentMethod(session.paymentMethod);
    }
    if (session?.selectedAddress?.id) {
      setSelectedAddressId(session.selectedAddress.id);
    }
    if (session?.deliveryType && session.freightPrice !== undefined) {
      selectDeliveryOption(session.deliveryType, {
        price: session.freightPrice,
        estimateLabel: session.freightEstimate ?? getDeliveryTypeLabel(session.deliveryType),
        estimateDays: 0,
      });
    }
  }, [session, selectDeliveryOption]);

  useEffect(() => {
    if (!session?.expiresAt) {
      return;
    }

    const updateCountdown = () => {
      const remaining = differenceInSeconds(parseISO(session.expiresAt), new Date());

      if (remaining <= 0) {
        setSecondsRemaining(0);
        setExpiredModalOpen(true);
        clearSession();
        return;
      }

      setSecondsRemaining(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [session?.expiresAt, clearSession]);

  useEffect(() => {
    const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
    const originZip = cart?.pharmacyZipCode ?? '';
    const destinationZip = selectedAddress?.zipCode ?? '';
    const recipientName = profile
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : undefined;
    const recipientPhone = profile?.mobilePhone ?? profile?.phone;

    void calculateAllDeliveryOptions(originZip, destinationZip, {
      cart,
      selectedAddress,
      recipientName,
      recipientPhone,
    });
  }, [addresses, selectedAddressId, cart, profile, calculateAllDeliveryOptions]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  const handleExpiredRedirect = () => {
    setExpiredModalOpen(false);
    navigate(ROUTES.CART);
  };

  const handleAddressFormSubmit = async (data: CreateAddressRequest, setAsDefault: boolean) => {
    try {
      setIsAddressSubmitting(true);
      const created = await createAddress(data, setAsDefault);
      setSelectedAddressId(created.id);
      setAddressFormOpen(false);
      await refetchAddresses();
    } finally {
      setIsAddressSubmitting(false);
    }
  };

  const handleDeliveryContinue = async () => {
    setDeliveryError(null);

    if (!selectedDeliveryType) {
      setDeliveryError('Selecione uma opção de entrega.');
      return;
    }

    if (selectedDeliveryType !== 'PICKUP' && !selectedAddressId) {
      setDeliveryError('Selecione um endereço de entrega.');
      return;
    }

    if (blocksDeliveryForPrescription && selectedDeliveryType !== 'PICKUP') {
      setDeliveryError(ORIGINAL_PRESCRIPTION_PICKUP_MESSAGE);
      toast.error(ORIGINAL_PRESCRIPTION_PICKUP_MESSAGE);
      return;
    }

    let pickupPerson: UpdatePickupPersonRequest | undefined;

    if (selectedDeliveryType === 'PICKUP' && isThirdPartyPickup) {
      const isValid = await trigger();
      if (!isValid) {
        return;
      }

      const parsed = thirdPartyPickupSchema.parse(getValues());
      pickupPerson = {
        pickupPersonName: parsed.pickupPersonName,
        pickupPersonCpf: parsed.pickupPersonCpf,
        pickupPersonPhone: parsed.pickupPersonPhone,
      };
    }

    const freightPrice =
      selectedDeliveryType === 'PICKUP' ? 0 : selectedFreight?.price ?? 0;
    const freightEstimate =
      selectedDeliveryType === 'PICKUP'
        ? 'Retirada na farmácia'
        : selectedFreight?.estimateLabel;

    try {
      await submitDelivery(
        {
          deliveryType: selectedDeliveryType,
          addressId: selectedDeliveryType === 'PICKUP' ? undefined : selectedAddressId ?? undefined,
          freightPrice,
          ...(freightEstimate ? { freightEstimate } : {}),
        },
        pickupPerson
      );
    } catch {
      // Erro exibido pelo hook (toast + estado error).
    }
  };

  const handlePaymentContinue = async () => {
    await submitPayment(paymentMethod);
  };

  const handlePlaceOrder = async () => {
    setPrescriptionError(null);

    try {
      const order = await placeOrder();

      if (order.status === 'PENDING_PAYMENT') {
        navigate(ROUTES.PAYMENT, {
          state: { orderId: order.id, paymentMethod: order.paymentMethod, order },
        });
        return;
      }

      navigate(ROUTES.ORDER_DETAIL.replace(':id', String(order.id)), {
        state: { justCreated: true, order },
      });
    } catch (err) {
      const parsed = err as ParsedOrderCreationError;

      if (parsed.code === 'session_expired') {
        toast.error(parsed.message);
        navigate(ROUTES.CART);
        return;
      }

      if (parsed.code === 'insufficient_stock') {
        const message = parsed.itemName
          ? `Estoque insuficiente: ${parsed.itemName}`
          : parsed.message;
        toast.error(message);
        navigate(ROUTES.CART);
        return;
      }

      if (
        parsed.code === 'prescription_required' ||
        parsed.code === 'prescription_pending' ||
        parsed.code === 'prescription_rejected' ||
        parsed.code === 'prescription_fulfillment_blocked'
      ) {
        setPrescriptionError(parsed.message);
        toast.error(parsed.message);
        await fetchCart();
      }
    }
  };

  const prescriptionItems = cart ? getPrescriptionItems(cart.items) : [];
  const hasBlockingPrescriptions = cart ? cartHasBlockingPrescriptions(cart.items) : false;
  const hasOnlineSaleBlocked = cart ? cartHasOnlineSaleBlocked(cart.items) : false;
  const requiresPrescriptionPickup = cart ? cartRequiresPickupForPrescription(cart.items) : false;
  const blocksDeliveryForPrescription = cart ? cartBlocksDeliveryForPrescription(cart.items) : false;
  const deliveryBlockedSelection =
    blocksDeliveryForPrescription &&
    selectedDeliveryType != null &&
    selectedDeliveryType !== 'PICKUP';
  const cannotFinalizeOrder =
    hasBlockingPrescriptions || hasOnlineSaleBlocked || deliveryBlockedSelection;

  useEffect(() => {
    if (!requiresPrescriptionPickup || deliveryOptions.length === 0) {
      return;
    }

    const pickupOption = deliveryOptions.find((option) => option.deliveryType === 'PICKUP');
    if (pickupOption && selectedDeliveryType !== 'PICKUP') {
      selectDeliveryOption('PICKUP', pickupOption.freight);
    }
  }, [requiresPrescriptionPickup, deliveryOptions, selectedDeliveryType, selectDeliveryOption]);

  const handleRemovePrescriptionItem = async (itemId: number) => {
    try {
      setRemovingItemId(itemId);
      await removeItem(itemId);
      await fetchCart();
    } finally {
      setRemovingItemId(null);
    }
  };

  const handlePrescriptionUploadSuccess = async () => {
    await fetchCart();
  };

  if (isLoading && !session) {
    return <PageLoader message="Preparando checkout..." />;
  }

  if (error && !session) {
    return <ErrorState message={error} onRetry={() => void initializeSession()} />;
  }

  if (!session) {
    return (
      <PageWrapper title="Checkout">
        <EmptyState
          title="Sessão não encontrada"
          description="Inicie o checkout a partir do carrinho."
          action={
            <Link to={ROUTES.CART}>
              <Button variant="primary">Ir para o carrinho</Button>
            </Link>
          }
        />
      </PageWrapper>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <PageWrapper title="Checkout">
        <EmptyState
          title="Carrinho vazio"
          description="Adicione itens ao carrinho antes de finalizar a compra."
          action={
            <Link to={ROUTES.LISTINGS}>
              <Button variant="primary">Ver anúncios</Button>
            </Link>
          }
        />
      </PageWrapper>
    );
  }

  const reviewFreightPrice =
    session?.deliveryType === 'PICKUP'
      ? 0
      : session?.freightPrice ?? selectedFreight?.price ?? 0;
  const reviewTotal = cart.subtotal - cart.discount + reviewFreightPrice;

  const showCountdown =
    secondsRemaining !== null && secondsRemaining > 0 && secondsRemaining < 5 * 60;

  return (
    <PageWrapper title="Checkout" description="Finalize sua compra em poucos passos.">
      {showCountdown && (
        <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-[var(--color-warning)]" role="alert">
          Sua sessão expira em {Math.floor(secondsRemaining / 60)}:
          {String(secondsRemaining % 60).padStart(2, '0')}
        </p>
      )}

      <StepIndicator currentStep={currentStep} />

      {currentStep === 'delivery' && (
        <section className="space-y-6">
          <div>
            <h2 className="mb-4 font-headline text-xl font-bold text-on-surface">Opções de entrega</h2>

            {requiresPrescriptionPickup && (
              <p
                className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-[var(--color-warning)]"
                role="alert"
              >
                {ORIGINAL_PRESCRIPTION_PICKUP_MESSAGE}
              </p>
            )}

            {hasOnlineSaleBlocked && (
              <p
                className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]"
                role="alert"
              >
                {ONLINE_SALE_BLOCKED_MESSAGE} Remova o item bloqueado ou volte ao carrinho.
              </p>
            )}

            {isFreightLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-2xl border border-outline-variant bg-surface-container"
                  />
                ))}
              </div>
            ) : deliveryOptions.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                Selecione um endereço para ver as opções de entrega disponíveis.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {deliveryOptions.map((option) => (
                  <DeliveryOptionCard
                    key={option.deliveryType}
                    deliveryType={option.deliveryType}
                    price={option.freight.price}
                    estimateLabel={option.freight.estimateLabel}
                    estimateDays={option.freight.estimateDays}
                    isSelected={selectedDeliveryType === option.deliveryType}
                    disabled={
                      hasOnlineSaleBlocked ||
                      (blocksDeliveryForPrescription && option.deliveryType !== 'PICKUP')
                    }
                    disabledReason={
                      hasOnlineSaleBlocked
                        ? ONLINE_SALE_BLOCKED_MESSAGE
                        : ORIGINAL_PRESCRIPTION_PICKUP_MESSAGE
                    }
                    onSelect={() => {
                      if (
                        hasOnlineSaleBlocked ||
                        (blocksDeliveryForPrescription && option.deliveryType !== 'PICKUP')
                      ) {
                        toast.error(
                          hasOnlineSaleBlocked
                            ? ONLINE_SALE_BLOCKED_MESSAGE
                            : ORIGINAL_PRESCRIPTION_PICKUP_MESSAGE
                        );
                        return;
                      }
                      selectDeliveryOption(option.deliveryType, option.freight);
                    }}
                  />
                ))}
              </div>
            )}

            {freightError && (
              <p className="mt-3 text-sm text-[var(--color-danger)]" role="alert">
                {freightError}
              </p>
            )}
          </div>

          {selectedDeliveryType === 'PICKUP' && (
            <>
              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                <h2 className="mb-3 font-headline text-xl font-bold text-on-surface">
                  Local de retirada
                </h2>
                <p className="text-on-surface">{formatCartPharmacyLine(cart)}</p>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                <input
                  type="checkbox"
                  checked={isThirdPartyPickup}
                  onChange={(event) => setIsThirdPartyPickup(event.target.checked)}
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                />
                <span className="font-medium text-on-surface">Retirada por terceiro</span>
              </label>

              {isThirdPartyPickup && (
                <form className="grid gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 sm:grid-cols-2">
                  <Input
                    label="Nome de quem vai retirar"
                    error={pickupErrors.pickupPersonName?.message}
                    className="sm:col-span-2"
                    {...register('pickupPersonName')}
                  />
                  <Input
                    label="CPF"
                    error={pickupErrors.pickupPersonCpf?.message}
                    {...register('pickupPersonCpf')}
                  />
                  <Input
                    label="Telefone (opcional)"
                    error={pickupErrors.pickupPersonPhone?.message}
                    {...register('pickupPersonPhone')}
                  />
                </form>
              )}
            </>
          )}

          {selectedDeliveryType !== 'PICKUP' && (
            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-headline text-xl font-bold text-on-surface">Endereço de entrega</h2>
                <Button variant="secondary" size="sm" onClick={() => setAddressFormOpen(true)}>
                  Adicionar endereço
                </Button>
              </div>

              {isAddressesLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : addresses.length === 0 ? (
                <EmptyState
                  title="Nenhum endereço cadastrado"
                  description="Adicione um endereço para calcular as opções de frete."
                  action={
                    <Button variant="primary" onClick={() => setAddressFormOpen(true)}>
                      Adicionar endereço
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${
                        selectedAddressId === address.id
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant bg-surface-container-lowest'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-1 h-4 w-4 text-primary focus:ring-primary/20"
                      />
                      <div>
                        <p className="font-medium text-on-surface">{formatAddressLine(address)}</p>
                        {address.isDefault && (
                          <Badge variant="success" className="mt-2">
                            Padrão
                          </Badge>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {deliveryError && (
            <p className="text-sm text-[var(--color-danger)]" role="alert">
              {deliveryError}
            </p>
          )}

          <div className="flex justify-end">
            <Button variant="primary" onClick={() => void handleDeliveryContinue()} isLoading={isSubmitting} disabled={hasOnlineSaleBlocked}>
              Continuar
            </Button>
          </div>
        </section>
      )}

      {currentStep === 'payment' && (
        <section className="space-y-6">
          <h2 className="font-headline text-xl font-bold text-on-surface">Forma de pagamento</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPaymentMethod(option.value)}
                className={`rounded-2xl border p-4 text-left font-semibold transition-colors ${
                  paymentMethod === option.value
                    ? 'border-primary bg-primary/5 text-on-surface'
                    : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between gap-3">
            <Button variant="secondary" onClick={() => goToStep('delivery')}>
              Voltar
            </Button>
            <Button variant="primary" onClick={() => void handlePaymentContinue()} isLoading={isSubmitting}>
              Continuar
            </Button>
          </div>
        </section>
      )}

      {currentStep === 'review' && (
        <section className="space-y-6">
          {prescriptionItems.length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface">Receita médica</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Envie a receita dos medicamentos abaixo antes de finalizar o pedido.
                </p>
              </div>

              {hasBlockingPrescriptions && (
                <p
                  className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900"
                  role="alert"
                >
                  Existem itens que exigem receita médica. Aguarde a aprovação da farmácia ou
                  corrija os itens antes de continuar.
                </p>
              )}

              {prescriptionError && (
                <p
                  className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]"
                  role="alert"
                >
                  {prescriptionError}
                </p>
              )}

              <div className="flex flex-col gap-4">
                {prescriptionItems.map((item) => (
                  <PrescriptionUploadCard
                    key={item.itemId}
                    item={item}
                    checkoutSessionToken={session?.sessionToken}
                    onUploadSuccess={handlePrescriptionUploadSuccess}
                    onRemoveItem={() => handleRemovePrescriptionItem(item.itemId)}
                    isRemoving={removingItemId === item.itemId}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="mb-4 font-headline text-xl font-bold text-on-surface">Resumo do pedido</h2>

            <div className="mb-6 space-y-3">
              <h3 className="text-sm font-semibold uppercase text-on-surface-variant">Itens</h3>
              {cart.items.map((item) => (
                <div key={item.itemId} className="flex justify-between gap-4 text-sm">
                  <span className="text-on-surface">
                    {item.quantity}× {item.productName}
                  </span>
                  <span className="font-medium text-on-surface">{formatCurrency(item.itemSubtotal)}</span>
                </div>
              ))}
            </div>

            <dl className="space-y-3 border-t border-outline-variant pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Entrega</dt>
                <dd className="text-on-surface">
                  {session.deliveryType ? getDeliveryTypeLabel(session.deliveryType) : '—'}
                </dd>
              </div>
              {session.deliveryType === 'PICKUP' ? (
                <>
                  <div className="flex justify-between gap-4">
                    <dt className="text-on-surface-variant">Local de retirada</dt>
                    <dd className="text-right text-on-surface">{formatCartPharmacyLine(cart)}</dd>
                  </div>
                  {session.pickupPersonName && (
                    <div className="flex justify-between">
                      <dt className="text-on-surface-variant">Retirada por terceiro</dt>
                      <dd className="text-right text-on-surface">
                        {session.pickupPersonName}
                        {session.pickupPersonCpf && (
                          <span className="block text-on-surface-variant">
                            CPF: {formatCpf(session.pickupPersonCpf)}
                          </span>
                        )}
                        {session.pickupPersonPhone && (
                          <span className="block text-on-surface-variant">
                            Tel: {session.pickupPersonPhone}
                          </span>
                        )}
                      </dd>
                    </div>
                  )}
                </>
              ) : (
                session.selectedAddress && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-on-surface-variant">Endereço</dt>
                    <dd className="text-right text-on-surface">
                      {formatAddressLine(session.selectedAddress)}
                    </dd>
                  </div>
                )
              )}
              {(session.freightPrice !== undefined || selectedFreight) && session.deliveryType !== 'PICKUP' && (
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">Frete</dt>
                  <dd className="text-on-surface">
                    {formatCurrency(reviewFreightPrice)}
                    {(selectedFreight?.estimateLabel ?? session.freightEstimate)
                      ? ` · ${selectedFreight?.estimateLabel ?? session.freightEstimate}`
                      : ''}
                  </dd>
                </div>
              )}
              {selectedDeliveryType === 'PICKUP' && selectedFreight && (
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">Frete</dt>
                  <dd className="text-on-surface">Grátis</dd>
                </div>
              )}
              {session.paymentMethod && (
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">Pagamento</dt>
                  <dd className="text-on-surface">{getPaymentMethodLabel(session.paymentMethod)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Subtotal</dt>
                <dd className="text-on-surface">{formatCurrency(cart.subtotal)}</dd>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">
                    Desconto{cart.couponCode ? ` (${cart.couponCode})` : ''}
                  </dt>
                  <dd className="text-[var(--color-success)]">-{formatCurrency(cart.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-outline-variant pt-3 text-base">
                <dt className="font-semibold text-on-surface">Total</dt>
                <dd className="font-headline font-bold text-primary">{formatCurrency(reviewTotal)}</dd>
              </div>
            </dl>
          </div>

          <div className="flex justify-between gap-3">
            <Button variant="secondary" onClick={() => goToStep('payment')}>
              Voltar
            </Button>
            <Button
              variant="primary"
              onClick={() => void handlePlaceOrder()}
              isLoading={isSubmitting}
              disabled={cannotFinalizeOrder}
            >
              Finalizar pedido
            </Button>
          </div>
          {hasOnlineSaleBlocked && (
            <p className="text-sm text-[var(--color-danger)]" role="alert">
              {ONLINE_SALE_BLOCKED_MESSAGE} Remova o item para continuar.
            </p>
          )}
          {deliveryBlockedSelection && (
            <p className="text-sm text-[var(--color-danger)]" role="alert">
              {ORIGINAL_PRESCRIPTION_PICKUP_MESSAGE}
            </p>
          )}
        </section>
      )}

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      <AddressFormModal
        isOpen={addressFormOpen}
        onClose={() => setAddressFormOpen(false)}
        onSubmit={handleAddressFormSubmit}
        isSubmitting={isAddressSubmitting}
      />

      <Modal
        isOpen={expiredModalOpen}
        onClose={handleExpiredRedirect}
        title="Sessão expirada"
        footer={
          <Button variant="primary" onClick={handleExpiredRedirect}>
            Ir para o carrinho
          </Button>
        }
      >
        <p className="text-on-surface-variant">
          Sua sessão de checkout expirou. Você será redirecionado para o carrinho.
        </p>
      </Modal>
    </PageWrapper>
  );
};
