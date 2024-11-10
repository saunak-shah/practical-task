import React from "react";
import { Modal } from "antd";

interface DeleteModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ visible, onCancel, onConfirm }) => (
  <Modal
    title="Confirm Deletion"
    visible={visible}
    onOk={onConfirm}
    onCancel={onCancel}
    okText="Yes"
    cancelText="No"
  >
    <p>Are you sure you want to delete this product?</p>
  </Modal>
);

export default DeleteModal;
