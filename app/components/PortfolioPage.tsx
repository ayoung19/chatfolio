"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { AppSchema } from "@/instant.schema";
import { db } from "@/lib/db/react";
import { cn } from "@/lib/utils";
import { InstaQLEntity } from "@instantdb/react";
import { useClipboard } from "@mantine/hooks";
import {
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconFileCv,
  IconMail,
} from "@tabler/icons-react";
import { Copy, Download, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Chat } from "./Chat";
import { CreatePortfolioForm } from "./CreatePortfolioForm";
import { ModeToggle } from "./ModeToggle";
import { SignInForm } from "./SignInForm";
import { UpdateContextForm } from "./UpdateContextForm";

interface Props {
  slug: string;
}

export function PortfolioPage({ slug }: Props) {
  const router = useRouter();
  // TODO: Modals manager.
  const [modalId, setModalId] = useState<string>();
  const clipboard = useClipboard();

  const { user, isLoading, error } = db.useAuth();

  const portfoliosQuery = db.useQuery({
    portfolios: {
      $: {
        where: {
          slug,
        },
      },
      contexts: {},
    },
  });
  const portfolio = portfoliosQuery.data?.portfolios[0];

  const myPortfoliosQuery = db.useQuery(
    user
      ? {
          portfolios: {
            $: {
              where: {
                "$user.id": user.id,
              },
            },
          },
        }
      : null,
  );
  const myPortfolio = user && myPortfoliosQuery.data?.portfolios[0];

  const resumeQuery = db.useQuery(
    portfolio
      ? {
          $files: {
            $: {
              where: {
                path: `${portfolio.id}/resume.pdf`,
              },
            },
          },
        }
      : null,
  );

  const avatarQuery = db.useQuery(
    portfolio
      ? {
          $files: {
            $: {
              where: {
                path: `${portfolio.id}/avatar.png`,
              },
            },
          },
        }
      : null,
  );

  // TODO: Better handling.
  if (isLoading || error) {
    return null;
  }

  if (portfoliosQuery.isLoading || portfoliosQuery.error) {
    return null;
  }

  if (portfolio === undefined) {
    return null;
  }

  const isMyPortfolio = portfolio.id === myPortfolio?.id;

  const resume = resumeQuery?.data?.$files[0];
  const avatar = avatarQuery?.data?.$files[0];

  const portfolioUrl = [window.location.origin, portfolio.slug].join("/");

  const downloadContext = async (context: InstaQLEntity<AppSchema, "contexts">) => {
    const mimeType = "application/text";
    const blob = new Blob([context.value], { type: mimeType });
    const link = document.createElement("a");

    link.download = `${context.name}.txt`;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadUrl = [mimeType, link.download, link.href].join(":");

    const event = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(event);
    link.remove();
  };

  return (
    <div className="flex max-h-[1800px] flex-col lg:h-screen">
      <div className="container mx-auto px-4 sm:px-0">
        <NavigationMenu className="flex-0 my-4">
          <NavigationMenuList className="flex items-center justify-center">
            <NavigationMenuItem className="hidden flex-1 sm:list-item">
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/">Chatfolio</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
                active={window.location.pathname === "/"}
              >
                <Link href="/">Latest Portfolio</Link>
              </NavigationMenuLink>
              {myPortfolio && (
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                  active={window.location.pathname === `/${myPortfolio.slug}`}
                >
                  <Link href={`/${myPortfolio.slug}`}>My Portfolio</Link>
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
            <NavigationMenuItem className="flex flex-1 items-center justify-end gap-2">
              <Dialog
                open={modalId === "sign-in"}
                onOpenChange={(open) => setModalId(open ? "sign-in" : undefined)}
              >
                <DialogTrigger asChild>
                  <Button variant="cta" size="sm" className={cn("hidden", !user && "inline-flex")}>
                    Create Portfolio or Sign In
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <SignInForm onClose={() => setModalId(undefined)} />
                </DialogContent>
              </Dialog>
              <Dialog
                open={modalId === "create-portfolio"}
                onOpenChange={(open) => setModalId(open ? "create-portfolio" : undefined)}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="cta"
                    size="sm"
                    className={cn("hidden", !!user && !myPortfolio && "inline-flex")}
                  >
                    Create Portfolio
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-screen max-w-full overflow-y-auto md:max-w-[768px]">
                  <CreatePortfolioForm
                    onClose={(slug) => {
                      setModalId(undefined);
                      router.push(`/${slug}`);
                    }}
                  />
                </DialogContent>
              </Dialog>
              {isMyPortfolio && (
                <Button
                  variant="secondary"
                  className="w-[300px]"
                  size="sm"
                  onClick={() => clipboard.copy(portfolioUrl)}
                >
                  <div className="flex w-full items-center justify-between">
                    <p className="text-xs">{clipboard.copied ? "Copied!" : portfolioUrl}</p>
                    <Copy size="0.5rem" />
                  </div>
                </Button>
              )}
              {user && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="bottom">
                      <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => db.auth.signOut()}>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              <Separator orientation="vertical" className="ml-2 h-4" />
              <ModeToggle />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="container mx-auto grid min-h-0 flex-1 grid-cols-12 gap-4 px-4 sm:px-0">
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-5 xl:col-span-4">
          <Card>
            <div className="gap-4 px-6 py-4">
              <div className="flex items-start">
                <div>
                  <h3 className="mb-1 scroll-m-20 text-2xl font-semibold tracking-tight">
                    {portfolio.name}
                  </h3>
                  <p className="mb-2 text-sm text-muted-foreground">{portfolio.about}</p>
                  <div className="flex gap-2">
                    {portfolio.linkedin && (
                      <Button size="icon" variant="outline" asChild>
                        <Link href={portfolio.linkedin} target="_blank">
                          <IconBrandLinkedin />
                        </Link>
                      </Button>
                    )}
                    {portfolio.github && (
                      <Button size="icon" variant="outline">
                        <Link href={portfolio.github} target="_blank">
                          <IconBrandGithub />
                        </Link>
                      </Button>
                    )}
                    {portfolio.instagram && (
                      <Button size="icon" variant="outline">
                        <Link href={portfolio.instagram} target="_blank">
                          <IconBrandInstagram />
                        </Link>
                      </Button>
                    )}
                    {portfolio.email && (
                      <Button size="icon" variant="outline">
                        <Link href={`mailto:${portfolio.email}`} target="_blank">
                          <IconMail />
                        </Link>
                      </Button>
                    )}
                    {resume && (
                      <Button size="icon" variant="outline">
                        <Link href={resume.url} target="_blank">
                          <IconFileCv />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col items-end">
                  <CardAction className={cn(!isMyPortfolio && "invisible")}>
                    <Dialog
                      open={modalId === "edit-portfolio"}
                      onOpenChange={(open) => setModalId(open ? "edit-portfolio" : undefined)}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm">Edit</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-full md:max-w-[768px]">
                        <CreatePortfolioForm
                          portfolio={portfolio}
                          onClose={(slug) => {
                            setModalId(undefined);
                            router.push(`/${slug}`);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardAction>
                  {avatar && (
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={avatar.url} />
                      <AvatarFallback>{portfolio.name[0] || null}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between px-6 py-4">
              <CardTitle>Context</CardTitle>
              <CardAction className={cn(!isMyPortfolio && "invisible")}>
                <Dialog
                  open={modalId === "create-context"}
                  onOpenChange={(open) => setModalId(open ? "create-context" : undefined)}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">Add</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-full md:max-w-[768px]">
                    <UpdateContextForm slug={slug} onClose={() => setModalId(undefined)} />
                  </DialogContent>
                </Dialog>
              </CardAction>
            </div>
            <CardContent>
              <div className="flex flex-col gap-4">
                {portfolio.contexts.map((context) => (
                  <Card key={context.id} className="shadow-none">
                    <div className="flex items-center justify-between px-6 py-4">
                      <CardTitle>{context.name}</CardTitle>
                      <CardAction>
                        <Dialog
                          open={modalId === `view-context-${context.id}`}
                          onOpenChange={(open) =>
                            setModalId(open ? `view-context-${context.id}` : undefined)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <Eye />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-full md:max-w-[768px]">
                            <UpdateContextForm
                              context={context}
                              slug={slug}
                              disabled={true}
                              onClose={() => setModalId(undefined)}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => downloadContext(context)}
                        >
                          <Download />
                        </Button>
                        {isMyPortfolio && (
                          <>
                            <Dialog
                              open={modalId === `edit-context-${context.id}`}
                              onOpenChange={(open) =>
                                setModalId(open ? `edit-context-${context.id}` : undefined)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <Pencil />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-full md:max-w-[768px]">
                                <UpdateContextForm
                                  context={context}
                                  slug={slug}
                                  onClose={() => setModalId(undefined)}
                                />
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => db.transact(db.tx.contexts[context.id]!.delete())}
                            >
                              <Trash2 />
                            </Button>
                          </>
                        )}
                      </CardAction>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 flex min-h-0 flex-1 flex-col pb-8 lg:col-span-7 xl:col-span-8">
          <Chat
            portfolio={portfolio}
            contexts={portfolio.contexts}
            openSignInModal={() => setModalId("sign-in")}
          />
        </div>
      </div>
    </div>
  );
}
