import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/db/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { id } from "@instantdb/react";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  slug: z.string(),
  name: z.string(),
  about: z.string(),
  linkedin: z.string(),
  github: z.string(),
  instagram: z.string(),
  email: z.string(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
}

export function CreatePortfolioForm({ onClose }: Props) {
  const auth = db.useAuth();

  const myPortfoliosQuery = db.useQuery(
    auth.user
      ? {
          portfolios: {
            $: {
              where: {
                "$user.id": auth.user.id,
              },
            },
          },
        }
      : null,
  );

  const myPortfolio = myPortfoliosQuery.data?.portfolios[0];

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      slug: "",
      name: "",
      about: "",
      linkedin: "",
      github: "",
      instagram: "",
      email: "",
    },
    mode: "all",
    resolver: zodResolver(schema),
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);

  const onSubmit: SubmitHandler<FormValues> = async ({
    slug,
    name,
    about,
    linkedin,
    github,
    instagram,
    email,
  }) => {
    try {
      await db.transact(
        db.tx.portfolios[id()]!.update({
          slug,
          name,
          about,
          linkedin,
          github,
          instagram,
          email,
        }).link({ $user: auth.user?.id }),
      );
    } catch (e) {
      console.log(e);

      // TODO: Handle error.

      return;
    }
  };

  const uploadFilesAndCloseModal = async (
    slug: string,
    resume: File | null,
    avatar: File | null,
  ) => {
    await Promise.all([
      resume && db.storage.uploadFile(`${slug}/resume.pdf`, resume),
      avatar && db.storage.uploadFile(`${slug}/avatar.png`, avatar),
    ]);

    onClose();
  };

  useEffect(() => {
    if (!myPortfolio) {
      return;
    }

    uploadFilesAndCloseModal(myPortfolio.slug, resume, avatar);
  }, [myPortfolio, resume, avatar]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* TODO: Slug default value. */}
      <Controller
        name="slug"
        control={control}
        render={({ field }) => (
          <div className="my-4">
            <Label htmlFor="slug">Slug</Label>
            <Input {...field} id="slug" placeholder="john-doe" required autoFocus />
            {errors.slug?.message ? (
              <p className="text-sm text-red-400">{errors.slug.message}</p>
            ) : (
              // <p className="text-sm text-muted-foreground">TODO: Description</p>
              <></>
            )}
          </div>
        )}
      />
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <div className="my-4">
            <Label htmlFor="name">Name</Label>
            <Input {...field} id="name" placeholder="John Doe" required />
            {errors.name?.message && <p className="text-sm text-red-400">{errors.name.message}</p>}
          </div>
        )}
      />
      <Controller
        name="about"
        control={control}
        render={({ field }) => (
          <div className="my-4">
            <Label htmlFor="about">About</Label>
            <Textarea
              {...field}
              id="about"
              placeholder="Senior Software Engineer at Meta"
              rows={4}
              required
            />
            {errors.about?.message && (
              <p className="text-sm text-red-400">{errors.about.message}</p>
            )}
          </div>
        )}
      />
      {/* TODO: Generic social media url parser. */}
      <Controller
        name="linkedin"
        control={control}
        render={({ field }) => (
          <div className="my-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <p className="text-sm text-muted-foreground">Optional</p>
            </div>
            <Input {...field} id="linkedin" />
            {errors.linkedin?.message && (
              <p className="text-sm text-red-400">{errors.linkedin.message}</p>
            )}
          </div>
        )}
      />
      <Controller
        name="github"
        control={control}
        render={({ field }) => (
          <div className="my-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="github">GitHub URL</Label>
              <p className="text-sm text-muted-foreground">Optional</p>
            </div>
            <Input {...field} id="github" />
            {errors.github?.message && (
              <p className="text-sm text-red-400">{errors.github.message}</p>
            )}
          </div>
        )}
      />
      <Controller
        name="instagram"
        control={control}
        render={({ field }) => (
          <div className="my-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="instagram">Instagram URL</Label>
              <p className="text-sm text-muted-foreground">Optional</p>
            </div>
            <Input {...field} id="instagram" />
            {errors.instagram?.message && (
              <p className="text-sm text-red-400">{errors.instagram.message}</p>
            )}
          </div>
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <div className="my-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email</Label>
              <p className="text-sm text-muted-foreground">Optional</p>
            </div>
            <Input {...field} id="email" />
            {errors.email?.message && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>
        )}
      />
      <div className="my-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="resume">Resume</Label>
          <p className="text-sm text-muted-foreground">Optional</p>
        </div>
        <Input id="resume" type="file" onChange={(e) => setResume(e.target.files?.[0] || null)} />
        {errors.email?.message && <p className="text-sm text-red-400">{errors.email.message}</p>}
      </div>
      <div className="my-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="avatar">Avatar</Label>
          <p className="text-sm text-muted-foreground">Optional</p>
        </div>
        <Input id="avatar" type="file" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
        {errors.email?.message && <p className="text-sm text-red-400">{errors.email.message}</p>}
      </div>
      {/* TODO: Loading state. */}
      <Button type="submit" size="sm" disabled={isSubmitting} className="w-full">
        Continue
      </Button>
    </form>
  );
}
