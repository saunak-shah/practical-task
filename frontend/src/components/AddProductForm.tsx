import React, { useEffect, useState } from "react";
import {
  Modal,
  Input,
  Form,
  Upload,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { AddProductFormProps } from "../interfaces/ProductInterface";


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
  const [fileList, setFileList] = useState<any[]>([]); // Holds the file list for the Upload component

  useEffect(() => {
    if (initialData && !isCreating) {
      // Set form values and file for edit mode
      form.setFieldsValue(initialData);
      setFileList([
        {
          uid: "-1",
          name: initialData.imageURL, // Placeholder name
          status: "done",
          url: initialData.imageURL, // URL of the existing image for preview
        },
      ]);
    } else {
      // Reset values for add mode
      form.setFieldsValue({});
      setFileList([]);
      setFile(null);
    }
  }, [visible, form, isCreating, initialData]);


  const handleFileChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      setFile(newFileList[0]?.originFileObj || null);
    } else {
      setFile(null);
    }
  };


  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();

      const formData = new FormData();
      for (const key in values) {
        if (values.hasOwnProperty(key)) {
          formData.append(key, values[key]);
        }
      }

      if (file) {
        formData.append("image", file);
      }

      await onSubmit(formData);
      setFile(null);
      onCancel();
    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
    } finally {
      setIsLoading(false);
    }
  };

  // Handling form reset when cancel button is clicked
  const handleCancel = () => {
    form.resetFields(); // Reset the form fields
    setFile(null); // Reset the file state
    setFileList([]);
    onCancel(); // Call the onCancel prop to close the modal
  };


  return (
    <Modal
      title={`${isCreating ? "Add" : "Edit"} Product`}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={isCreating ? "Create" : "Update"}
      cancelText="Cancel"
      confirmLoading={isLoading}
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
          rules={[{ required: true, message: "Please input the product description!" }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="Product Image">
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleFileChange}
            onPreview={(file) => window.open(file.url || file.thumbUrl, "_blank")}
            onRemove={() => {
              setFile(null); 
              return true;
            }}
          >
            {/* Only show upload button if there is no image preview */}
            {fileList.length === 0 && (
              <div>
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProductForm;

