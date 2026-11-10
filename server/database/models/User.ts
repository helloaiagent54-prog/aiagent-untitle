import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole =
  | 'customer'
  | 'super_admin'
  | 'admin'
  | 'order_manager'
  | 'inventory_manager'
  | 'catalog_manager'
  | 'customer_support'
  | 'finance';

export interface IUserAddress {
  id?: string;
  isDefault?: boolean;
  label?: string;
  recipientName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  unionOrWard?: string;
  streetAddress: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  addresses: IUserAddress[];
  wishlist: mongoose.Types.ObjectId[];
  cart: {
    productId: string;
    variantId?: string;
    quantity: number;
    options?: Record<string, string>;
  }[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema<IUserAddress>({
  isDefault: { type: Boolean, default: false },
  label: { type: String, default: 'Home' },
  recipientName: { type: String, required: true },
  phone: { type: String, required: true },
  division: { type: String, required: true },
  district: { type: String, required: true },
  upazila: { type: String, required: true },
  unionOrWard: { type: String, default: '' },
  streetAddress: { type: String, required: true },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        'customer',
        'super_admin',
        'admin',
        'order_manager',
        'inventory_manager',
        'catalog_manager',
        'customer_support',
        'finance',
      ],
      default: 'customer',
    },
    phone: { type: String, default: '' },
    addresses: [AddressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product', default: [] }],
    cart: [
      {
        productId: { type: String, required: true },
        variantId: { type: String },
        quantity: { type: Number, required: true, default: 1 },
        options: { type: Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password || '', salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
