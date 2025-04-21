import mongoose, { Document, Schema } from 'mongoose';

// Application Interface
export interface IApplication extends Document {
  name: string;
  slug: string;
  description: string;
  creator: string;
  price: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  stats: {
    totalSupply: number;
    minted: number;
  };
  assets: {
    images: string[];
    metadata?: string;
  };
  isComplete: boolean;
  collectionCreated: boolean;
}

// Application Schema
const ApplicationSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    creator: { type: String, required: true },
    price: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending'
    },
    submittedAt: { type: Date, default: Date.now },
    stats: {
      totalSupply: { type: Number, required: true },
      minted: { type: Number, default: 0 }
    },
    assets: {
      images: [{ type: String }],
      metadata: { type: String }
    },
    isComplete: { type: Boolean, default: false },
    collectionCreated: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Auto-generate slug from name - only if slug isn't provided
ApplicationSchema.pre<IApplication>('save', function (next) {
  // Only generate a slug if this is a new document AND no slug has been provided
  if (this.isNew && (!this.slug || this.slug.trim() === '')) {
    // Generate a slug with a timestamp to ensure uniqueness
    const timestamp = new Date().getTime().toString().slice(-6);
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-') + '-' + timestamp;
    
    console.log('Mongoose hook generated slug:', this.slug);
  }
  next();
});

export default mongoose.model<IApplication>('Application', ApplicationSchema); 