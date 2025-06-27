"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { AppSchema } from "@/instant.schema";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { InstaQLEntity } from "@instantdb/react";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Chat } from "./Chat";
import { CreatePortfolioForm } from "./CreatePortfolioForm";
import { SignInForm } from "./SignInForm";
import { UpdateContextForm } from "./UpdateContextForm";

interface Props {
  slug: string;
}

export function PortfolioPage({ slug }: Props) {
  // TODO: Modals manager.
  const [modalId, setModalId] = useState<string>();

  const { user, isLoading, error } = db.useAuth();

  const portfoliosQuery = db.useQuery({
    portfolios: {
      $: {
        where: {
          slug,
        },
      },
    },
  });

  const contextsQuery = db.useQuery({
    contexts: {
      $: {
        where: {
          "portfolio.slug": slug,
        },
      },
    },
  });

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

  // TODO: Better handling.
  if (isLoading || error) {
    return null;
  }

  if (portfoliosQuery.isLoading || portfoliosQuery.error) {
    return null;
  }

  const portfolio = portfoliosQuery.data.portfolios[0];
  const myPortfolio = myPortfoliosQuery.data?.portfolios[0];

  if (portfolio === undefined) {
    return null;
  }

  const isMyPortfolio = portfolio.id === myPortfolio?.id;

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
    <div className="flex h-screen flex-col">
      <div className="container mx-auto">
        <NavigationMenu className="flex-0 my-4">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/docs">Chatfolio</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              {!user ? (
                <Dialog
                  open={modalId === "sign-in"}
                  onOpenChange={(open) => setModalId(open ? "sign-in" : undefined)}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">Sign In</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <SignInForm onClose={() => setModalId(undefined)} />
                  </DialogContent>
                </Dialog>
              ) : !myPortfolio ? (
                <Dialog
                  open={modalId === "create-portfolio"}
                  onOpenChange={(open) => setModalId(open ? "create-portfolio" : undefined)}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">Create Portfolio</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <CreatePortfolioForm onClose={() => setModalId(undefined)} />
                  </DialogContent>
                </Dialog>
              ) : (
                <Button size="sm" asChild>
                  <Link href={`/${myPortfolio.slug}`}>My Portfolio</Link>
                </Button>
              )}
              {!!user && (
                <Button size="sm" variant="secondary" onClick={() => db.auth.signOut()}>
                  Sign Out
                </Button>
              )}
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="container mx-auto grid min-h-0 flex-1 grid-cols-12 gap-4">
        <div className="col-span-4 flex flex-col gap-4">
          <Card>
            <div className="px-6 py-4">
              <h3 className="mb-1 scroll-m-20 text-2xl font-semibold tracking-tight">
                {portfolio.name}
              </h3>
              <p className="mb-2 text-sm text-muted-foreground">{portfolio.about}</p>
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
                  <DialogContent className="sm:max-w-[425px]">
                    <UpdateContextForm slug={slug} onClose={() => setModalId(undefined)} />
                  </DialogContent>
                </Dialog>
              </CardAction>
            </div>
            <CardContent>
              <div className="flex flex-col gap-4">
                {contextsQuery.data?.contexts.map((context) => (
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
                              <Eye size="1rem" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
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
                          <Download size="1rem" />
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
                                  <Pencil size="1rem" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
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
                              <Trash2 size="1rem" />
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
        <div className="col-span-8 flex min-h-0 flex-1 flex-col pb-8">
          <Chat portfolio={portfolio} contexts={contextsQuery.data?.contexts || []} />
        </div>
      </div>
    </div>
  );
}
