// Re-export MongoDB utilities from @/lib/database
export {
    connectToMongoDB,
    getMongoDatabase,
    closeMongoConnection,
    getCollection
} from '@/lib/database'; 