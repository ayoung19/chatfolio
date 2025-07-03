import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppSchema } from "@/instant.schema";
import { db } from "@/lib/db/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { id, InstaQLEntity } from "@instantdb/react";
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
  portfolio?: InstaQLEntity<AppSchema, "portfolios">;
  onClose: (slug: string) => void;
}

export function CreatePortfolioForm({ portfolio, onClose }: Props) {
  const { user } = db.useAuth();

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: portfolio || {
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
      const portfolioId = portfolio?.id || id();

      await db.transact(
        db.tx.portfolios[portfolioId]!.update({
          slug,
          name,
          about,
          linkedin,
          github,
          instagram,
          email,
        }).link({ $user: user?.id }),
      );

      await Promise.all([
        resume && db.storage.uploadFile(`${portfolioId}/resume.pdf`, resume),
        avatar && db.storage.uploadFile(`${portfolioId}/avatar.png`, avatar),
      ]);

      onClose(slug);
    } catch (e) {
      console.log(e);

      // TODO: Handle error.

      return;
    }
  };

  // TODO: Make sure default value is unique.
  useEffect(() => {
    if (portfolio !== undefined || !user?.email) {
      return;
    }

    setValue("slug", `${user.email.split("@")[0]}-${crypto.randomUUID().slice(0, 8)}` || "");
  }, [portfolio !== undefined, user?.email]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
              <p className="text-sm text-muted-foreground">
                The link to your portfolio will be
                <> </>
                {[window.location.origin, watch("slug")].join("/")}
              </p>
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
