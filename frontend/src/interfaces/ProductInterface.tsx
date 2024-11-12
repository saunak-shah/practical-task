import { FormInstance } from "antd";

export interface Product {
  _id: string;
  productName: string;
  productDesc: string;
  imageURL: string;
}

export interface AddProductFormProps {
  form: FormInstance<any>;
  visible: boolean;
  onCancel: () => void;
  onSubmit: (product: any) => Promise<void>;
  initialData: any;
}
