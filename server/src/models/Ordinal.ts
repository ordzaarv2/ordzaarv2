import mongoose, { Document, Schema } from 'mongoose';

// Ordinal Interface
export interface IOrdinal extends mongoose.Document {
  name: string;
  description: string;
  image: string;
  ordinalNumber: number;
  collectionId: mongoose.Types.ObjectId;
  price: string;
  owner: string;
  status: 'pending' | 'minted' | 'failed';
  blockchainData?: {
    txid: string;
    inscriptionId: string;
    contentType: string;
    address: string;
  };
  mintedAt?: Date;
}

// Ordinal Schema
const OrdinalSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    ordinalNumber: { type: Number, required: true },
    collectionId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Collection', 
      required: true 
    },
    price: { type: String, required: true },
    owner: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'minted', 'failed'], 
      default: 'pending' 
    },
    blockchainData: {
      txid: { type: String },
      inscriptionId: { type: String },
      contentType: { type: String },
      address: { type: String }
    },
    mintedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<IOrdinal>('Ordinal', OrdinalSchema); 