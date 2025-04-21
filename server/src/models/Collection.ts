import mongoose, { Document, Schema } from 'mongoose';

// Collection Interface
export interface ICollection extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  creator: string;
  price: string;
  totalSupply: number;
  minted: number;
  stats: {
    volume: number;
    sales: number;
    floorPrice: string;
  };
  settings: {
    isVisible: boolean;
    royaltyPercentage: number;
  };
  applicationId: mongoose.Types.ObjectId;
}

// Collection Schema
const CollectionSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    creator: { type: String, required: true },
    price: { type: String, required: true },
    totalSupply: { type: Number, required: true },
    minted: { type: Number, default: 0 },
    stats: {
      volume: { type: Number, default: 0 },
      sales: { type: Number, default: 0 },
      floorPrice: { type: String, default: '0' }
    },
    settings: {
      isVisible: { type: Boolean, default: true },
      royaltyPercentage: { type: Number, default: 5 }
    },
    applicationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Application', 
      required: true 
    }
  },
  { timestamps: true }
);

// Auto-generate slug from name
CollectionSchema.pre<ICollection>('save', function (next) {
  if (this.isNew && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

export default mongoose.model<ICollection>('Collection', CollectionSchema); 