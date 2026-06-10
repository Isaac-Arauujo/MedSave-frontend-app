import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useCart } from '../../hooks/useCart';

export const MergeCartConflictModal = () => {
  const {
    mergeConflict,
    isSubmitting,
    dismissMergeConflict,
    keepAccountCartOnMergeConflict,
    useAnonymousCartOnMergeConflict,
  } = useCart();

  return (
    <Modal
      isOpen={Boolean(mergeConflict)}
      onClose={dismissMergeConflict}
      title="Carrinhos de farmácias diferentes"
      footer={
        <>
          <Button variant="secondary" onClick={keepAccountCartOnMergeConflict} disabled={isSubmitting}>
            Manter carrinho da conta
          </Button>
          <Button
            variant="primary"
            onClick={() => void useAnonymousCartOnMergeConflict()}
            isLoading={isSubmitting}
          >
            Usar carrinho salvo
          </Button>
        </>
      }
    >
      <p className="text-on-surface-variant">
        Seu carrinho da conta possui itens de{' '}
        <strong className="text-on-surface">{mergeConflict?.currentPharmacyName}</strong>, mas os
        itens salvos são de{' '}
        <strong className="text-on-surface">{mergeConflict?.incomingPharmacyName}</strong>.
        Escolha qual carrinho deseja manter.
      </p>
    </Modal>
  );
};
