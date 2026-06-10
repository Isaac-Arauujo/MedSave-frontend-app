import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useCart } from '../../hooks/useCart';

export const OnePharmacyConflictModal = () => {
  const {
    pharmacyConflict,
    isSubmitting,
    dismissPharmacyConflict,
    resolvePharmacyConflict,
  } = useCart();

  return (
    <Modal
      isOpen={Boolean(pharmacyConflict)}
      onClose={dismissPharmacyConflict}
      title="Itens de uma única farmácia"
      size="sm"
      footer={
        <>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={dismissPharmacyConflict}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => void resolvePharmacyConflict()}
            isLoading={isSubmitting}
          >
            Limpar carrinho e adicionar
          </Button>
        </>
      }
    >
      <p className="break-words text-on-surface-variant">
        Seu carrinho possui itens de{' '}
        <strong className="text-on-surface">{pharmacyConflict?.currentPharmacyName}</strong>
        {pharmacyConflict?.incomingPharmacyName ? (
          <>
            , mas o novo item é de{' '}
            <strong className="text-on-surface">{pharmacyConflict.incomingPharmacyName}</strong>
          </>
        ) : null}
        .
      </p>
      <p className="mt-3 break-words text-on-surface-variant">
        Para adicionar este produto, será necessário limpar o carrinho atual.
      </p>
    </Modal>
  );
};
