import { useLiveQuery } from "dexie-react-hooks";
import { getDB, type Pengaturan } from "@/lib/db";

const DEFAULT: Pengaturan = {
  id: "main",
  namaNotaris: "",
  gelar: "S.H., M.Kn.",
  skPengangkatan: "",
  wilayahJabatan: "",
  kotaKedudukan: "",
  alamatKantor: "",
};

export function usePengaturan(): Pengaturan {
  const data = useLiveQuery(async () => {
    const db = getDB();
    if (!db) return DEFAULT;
    return (await db.pengaturan.get("main")) ?? DEFAULT;
  }, []);
  return data ?? DEFAULT;
}
