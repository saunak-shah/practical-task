import React, { useEffect, useState } from "react";
import {
  Modal,
  Input,
  Form,
  FormInstance,
  Upload,
  message,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface AddProductFormProps {
  form: FormInstance<any>;
  visible: boolean;
  onCancel: () => void;
  onSubmit: (product: any) => Promise<void>;
  initialData: any;
}

const AddProductForm: React.FC<AddProductFormProps> = ({
  form,
  visible,
  onCancel,
  onSubmit,
  initialData,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  let isCreating = !initialData;

  useEffect(() => {
    console.log("ddddddddddddd",visible)
    console.log("isCreating",isCreating)
    console.log(initialData)
    if (initialData && !isCreating) {
      console.log("111111111111111")

      form.setFieldsValue(initialData); // Set form values for editing
      setFile(null); // Reset file state for Add mode
    } else {
      console.log("88888888888")
      form.setFieldsValue( {}); // Set initial data for Edit mode
      setFile(null); // Reset file state for Add mode
    }
    /* if (visible) {
      // If in Add mode (no initialData), reset form
      if (isCreating) {
        form.resetFields(initialData || {});
        setFile(null); // Reset file state for Add mode
      } else {
        form.setFieldsValue(initialData); // Set initial data for Edit mode
        setFile(null); // Optional: clear the file state on opening modal for Edit mode
      }
    } */
  }, [visible, form, isCreating, initialData]);


  const handleFileChange = ({ fileList }: any) => {
    const selectedFile = fileList[0]?.originFileObj || null;
    setFile(selectedFile); // Update file state with the selected file
  };


  const handleSubmit = async () => {
    try {
      setIsLoading(true); // Show loading when process starts
      const values = await form.validateFields();
      console.log("file===========", file);
      console.log("values===========", values);

      const formData = new FormData();

      // Append form values to formData
      for (const key in values) {
        if (values.hasOwnProperty(key)) {
          formData.append(key, values[key]);
        }
      }

      // If editing and no new image, skip appending the file to FormData
      if (file) {
        formData.append("image", file);
      }

      await onSubmit(formData); // Pass formData to onSubmit function
      setFile(null); // Clear the selected file after submission
      onCancel(); // Optionally close the modal after submission
    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
    }
  };

  // Handling form reset when cancel button is clicked
  const handleCancel = () => {
    form.resetFields(); // Reset the form fields
    setFile(null); // Reset the file state
    onCancel(); // Call the onCancel prop to close the modal
  };


  return (
    <Modal
      title={`${isCreating ? "Add" : "Edit"} Product`}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel} // Ensure the form is reset when the modal is closed
      okText={isCreating ? "Create" : "Update"}
      cancelText="Cancel"
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical" style={{ width: "90%" }}>
        <Form.Item
          name="productName"
          label="Product Name"
          rules={[{ required: true, message: "Please input the product name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="productDesc"
          label="Product Description"
          rules={[
            { required: true, message: "Please input the product description!" },
            { min: 10, message: "Description must be at least 10 characters" },
            { max: 200, message: "Description cannot exceed 200 characters" },        
          ]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Product Image">
          <Upload
            name="image"
            listType="picture"
            beforeUpload={() => false} // Prevent auto-upload
            onChange={handleFileChange}
            maxCount={1} // Allow only one image
          >
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
          {file && <p>Selected file: {file.name}</p>}
        </Form.Item>
      </Form>
    </Modal>
  );
};



export default AddProductForm;
