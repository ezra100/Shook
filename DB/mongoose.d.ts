declare module "mongoose"{
    interface Model<T extends Document>{
        estimatedDocumentCount(): Query<number>;
    }
}