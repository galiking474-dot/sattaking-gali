import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getFirebaseStorage } from "./firebase";

export async function uploadImage(
  file: File,
  folder: "banners" | "ads"
): Promise<string> {
  const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  const storageRef = ref(getFirebaseStorage(), `${folder}/${filename}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function deleteImage(url: string) {
  try {
    const storageRef = ref(getFirebaseStorage(), url);
    await deleteObject(storageRef);
  } catch {
    // File may not exist, ignore
  }
}
