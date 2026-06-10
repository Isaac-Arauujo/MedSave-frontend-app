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
      footer={
        <>
          <Button variant="secondary" onClick={dismissPharmacyConflict} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => void resolvePharmacyConflict()}
            isLoading={isSubmitting}
          >
            Limpar e adicionar
          </Button>
        </>
      }
    >
      <p className="text-on-surface-variant">
        Seu carrinho possui itens de{' '}
        <strong className="text-on-surface">{pharmacyConflict?.currentPharmacyName}</strong>
        {pharmacyConflict?.incomingPharmacyName ? (
          <>
            , mas o novo item é de{' '}
            <strong className="text-on-surface">{pharmacyConflict.incomingPharmacyName}</strong>
          </>
        ) : null}
        . Esvazie o carrinho para adicionar produtos de outra farmácia?
      </p>
    </Modal>
  );
};
