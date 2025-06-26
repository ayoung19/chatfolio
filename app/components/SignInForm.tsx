import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { match } from "ts-pattern";
import { z } from "zod";

const schema = z.object({
  email: z.string(),
  code: z.string(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
}

export function SignInForm({ onClose }: Props) {
  const auth = db.useAuth();

  const [step, setStep] = useState<0 | 1>(0);

  const {
    control,
    setError,
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      code: "",
    },
    mode: "all",
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = async ({ email, code }) => {
    await match(step)
      .with(0, async () => {
        try {
          await db.auth.sendMagicCode({ email });
        } catch (e) {
          console.log(e);

          setError("email", { type: "manual", message: "Invalid email" });

          return;
        }

        setStep(1);
      })
      .with(1, async () => {
        try {
          await db.auth.signInWithMagicCode({ email, code });
        } catch (e) {
          console.log(e);

          setError("code", { type: "manual", message: "Invalid code" });
          setValue("code", "");

          return;
        }
      })
      .exhaustive();
  };

  useEffect(() => {
    if (!auth.user) {
      return;
    }

    onClose();
  }, [auth.user]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {match(step)
        .with(0, () => (
          <div className="flex flex-col items-center">
            {/* TODO: Logo */}
            {/* <Image src={iconSrc} maw={32} mb="md" /> */}
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              Sign in to Chatfolio
            </h4>
            <p className="text-sm text-muted-foreground">
              Welcome! Please enter your email to continue
            </p>
          </div>
        ))
        .with(1, () => (
          <div className="flex flex-col items-center">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Check your email</h4>
            <p className="text-sm text-muted-foreground">to continue to Chatfolio</p>
            <div className="flex items-center">
              <p className="mr-1 text-sm text-muted-foreground">{watch("email")}</p>
              <PencilLine
                size="1rem"
                className="cursor-pointer"
                onClick={() => {
                  setStep(0);
                  reset();
                }}
              />
            </div>
          </div>
        ))
        .exhaustive()}
      <Controller
        name="email"
        control={control}
        render={({ field }) =>
          step === 0 ? (
            <div className="my-4">
              <Label htmlFor="email">Email address</Label>
              <Input {...field} id="email" required autoFocus />
              {errors.email?.message && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>
          ) : (
            <></>
          )
        }
      />
      <Controller
        name="code"
        control={control}
        render={({ field }) =>
          step === 1 ? (
            <div className="my-8 flex w-full flex-col items-center">
              <InputOTP
                {...field}
                maxLength={6}
                onComplete={() => handleSubmit(onSubmit)()}
                required
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {errors.code?.message && (
                <p className="mt-4 text-sm text-red-400">{errors.code.message}</p>
              )}
            </div>
          ) : (
            <></>
          )
        }
      />
      {/* TODO: Loading state. */}
      <Button type="submit" size="sm" disabled={isSubmitting} className="w-full">
        Continue
      </Button>
    </form>
  );
}
