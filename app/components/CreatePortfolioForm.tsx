import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/db";
import { zodResolver } from "@hookform/resolvers/zod";
import { id } from "@instantdb/react";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  slug: z.string(),
  name: z.string(),
  about: z.string(),
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

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      slug: "",
      name: "",
      about: "",
    },
    mode: "all",
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = async ({ slug, name, about }) => {
    try {
      await db.transact(
        db.tx.portfolios[id()].update({ slug, name, about }).link({ $user: auth.user?.id }),
      );
    } catch (e) {
      console.log(e);

      // TODO: Handle error.

      return;
    }
  };

  useEffect(() => {
    if (!myPortfoliosQuery.data?.portfolios.length) {
      return;
    }

    onClose();
  }, [!myPortfoliosQuery.data?.portfolios.length]);

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
              <p className="text-sm text-muted-foreground">TODO: Description</p>
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
      {/* TODO: Loading state. */}
      <Button type="submit" size="sm" disabled={isSubmitting} className="w-full">
        Continue
      </Button>
    </form>
  );
}
