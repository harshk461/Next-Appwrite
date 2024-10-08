import { database, ID, storage, account } from "@/Utils/appwrite";
import { Permission, Query, QueryTypes } from "appwrite";
import toast from "react-hot-toast";

interface Props {
  file: File;
  name: string;
  email: string;
}

export const AddNewFile = async ({
  file,
  name,
  email,
  folderId,
}: Props & { folderId: string | null }) => {
  try {
    const user = await account.get();
    if (!user) throw new Error("User is not authenticated");

    const fileResponse = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      ID.unique(),
      file
    );

    const previewUrl = storage.getFilePreview(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      fileResponse.$id,
      400,
      400
    );

    await database.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      ID.unique(),
      {
        file: fileResponse.$id,
        name,
        type: file.type,
        createdAt: new Date().toISOString(),
        email,
        previewUrl: previewUrl.toString(),
        folderId: folderId || null, // Associate with the folder
      },
      [Permission.write("any")]
    );

    toast.success("File uploaded successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to upload file");
  }
};

export const getAllData = async (folderId: string | null = null) => {
  try {
    const user = await account.get();
    if (!user) throw new Error("User is not authenticated");

    // Prepare the query based on whether folderId is null
    const queries = [Query.equal("email", user.email)];

    // Add the folderId query if folderId is not null
    if (folderId !== null) {
      queries.push(Query.equal("folderId", folderId));
    }

    const response = await database.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      queries
    );
    return response.documents;
  } catch (e) {
    console.log(e);
    toast.error("Failed to retrieve data");
  }
};
export const DeleteFile = async (id: string) => {
  try {
    await database.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      id
    );
    toast.success("File deleted successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete file");
  }
};

export const UpdateFileName = async (id: string, name: string) => {
  try {
    await database.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      id,
      {
        name: name,
      }
    );
    toast.success("File name updated successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to update file name");
  }
};

export const UpdateFile = async (id: string, file: File) => {
  try {
    const fileResponse = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      ID.unique(),
      file
    );

    const previewUrl = storage.getFilePreview(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      fileResponse.$id,
      400,
      400
    );

    await database.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      id,
      {
        file: fileResponse.$id,
        type: file.type,
        previewUrl: previewUrl.toString(),
      }
    );
    toast.success("File updated successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to update file");
  }
};

export const DownloadFile = async (id: string) => {
  try {
    const response = await database.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      id
    );

    const file = storage.getFileDownload(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      response.file
    );
    // console.log(file);
    // const url = URL.createObjectURL(file.href);
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = response.name;
    // a.click();
    window.open(file.toString());
  } catch (error) {
    console.error(error);
    toast.error("Failed to download file");
  }
};

export const GetFileView = (id: string) => {
  try {
    const res = storage.getFileView(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      id
    );
    window.open(res.href);
  } catch (e) {
    console.log(e);
  }
};

export const StarFile = async (id: string) => {
  try {
    await database.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      id,
      {
        starred: true,
      }
    );
    toast.success("File starred successfully");
  } catch (e) {
    console.log(e);
    toast.error("Failed to star file");
  }
};

export const GetAllStarredFile = async () => {
  try {
    const user = await account.get();
    if (!user) {
      toast.error("User is not authenticated");
    }
    const response = await database.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      [Query.equal("starred", true), Query.equal("email", user.email)]
    );

    return response.documents;
  } catch (e) {
    console.log(e);
    toast.error("Failed to get starred files");
  }
};

export const UnStartFile = async (id: string) => {
  try {
    await database.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      id,
      {
        starred: false,
      }
    );
    toast.success("File unstarred successfully");
  } catch (e) {
    console.log(e);
    toast.error("Failed to unstar file");
  }
};
