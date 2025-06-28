import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppSchema } from "@/instant.schema";
import { db } from "@/lib/db/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { id, InstaQLEntity, lookup } from "@instantdb/react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  value: z.string(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  context?: InstaQLEntity<AppSchema, "contexts">;
  slug: string;
  disabled?: boolean;
  onClose: () => void;
}

export function UpdateContextForm({ context, slug, disabled, onClose }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: context,
    mode: "all",
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = async ({ name, value }) => {
    try {
      await db.transact(
        db.tx.contexts[context?.id || id()]!.update({ name, value }).link({
          portfolio: lookup("slug", slug),
        }),
      );
    } catch (e) {
      console.log(e);

      // TODO: Handle error.

      return;
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <div className="my-4">
            <Label htmlFor="name">Name</Label>
            <Input
              {...field}
              id="name"
              placeholder="Links to all merged open source contributions"
              disabled={disabled}
              required
              autoFocus
            />
            {errors.name?.message && <p className="text-sm text-red-400">{errors.name.message}</p>}
          </div>
        )}
      />
      <Controller
        name="value"
        control={control}
        render={({ field }) => (
          <div className="my-4">
            <Label htmlFor="value">Value</Label>
            <Textarea
              {...field}
              id="value"
              placeholder={`https://github.com/gustavo-depaula/stalin-sort/pull/175

https://github.com/pylint-dev/pylint/pull/6492`}
              disabled={disabled}
              rows={8}
              required
            />
            {errors.value?.message && (
              <p className="text-sm text-red-400">{errors.value.message}</p>
            )}
          </div>
        )}
      />
      {/* TODO: Loading state. */}
      {!disabled && (
        <Button type="submit" size="sm" disabled={isSubmitting} className="w-full">
          Continue
        </Button>
      )}
    </form>
  );
}
