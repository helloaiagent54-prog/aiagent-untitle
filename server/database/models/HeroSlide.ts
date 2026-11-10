import mongoose, { Document, Schema } from 'mongoose';

export interface IHeroSlideItem extends Document {
  title: string; // Internal admin identifier only (e.g. "Spring Collection Promo")
  desktopImage: string; // Required image asset
  mobileImage?: string; // Optional mobile-specific image
  destinationUrl?: string; // Optional destination URL (makes entire slide clickable)
  target: '_self' | '_blank';
  order: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSlideItemSchema = new Schema<IHeroSlideItem>(
  {
    title: { type: String, required: true, trim: true },
    desktopImage: { type: String, required: true },
    mobileImage: { type: String, default: '' },
    destinationUrl: { type: String, default: '', trim: true },
    target: { type: String, enum: ['_self', '_blank'], default: '_self' },
    order: { type: Number, default: 1, index: true },
    isActive: { type: Boolean, default: true, index: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export const HeroSlideModel =
  mongoose.models.HeroSlide ||
  mongoose.model<IHeroSlideItem>('HeroSlide', HeroSlideItemSchema);
