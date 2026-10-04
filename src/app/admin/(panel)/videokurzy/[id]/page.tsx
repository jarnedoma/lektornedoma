import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader } from "@/components/admin/ui";
import { VideoForm } from "@/components/admin/video-form";
import { ConfirmButton } from "@/components/admin/client-bits";
import { deleteVideoCourse } from "../../../actions";

export const metadata = { title: "Videokurz" };

export default async function EditVideo({ params }: { params: Promise<{ id: string }> }) {
  const raw = (await params).id;
  if (raw === "novy") {
    return (
      <>
        <AdminHeader title="Nový videokurz" back={{ href: "/admin/videokurzy", label: "Videokurzy" }} />
        <VideoForm />
      </>
    );
  }
  const id = Number(raw);
  const [v] = Number.isInteger(id) ? await db.select().from(schema.videoCourses).where(eq(schema.videoCourses.id, id)) : [];
  if (!v) notFound();
  return (
    <>
      <AdminHeader
        title={v.title}
        back={{ href: "/admin/videokurzy", label: "Videokurzy" }}
        actions={
          <>
            <Link href={`/videokurzy/${v.slug}`} target="_blank" className="btn-ghost btn-sm">Na webu ↗</Link>
            <form action={deleteVideoCourse}>
              <input type="hidden" name="id" value={v.id} />
              <ConfirmButton>Smazat</ConfirmButton>
            </form>
          </>
        }
      />
      <VideoForm v={v} />
    </>
  );
}
