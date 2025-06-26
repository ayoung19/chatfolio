"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { db } from "@/lib/db";
import Link from "next/link";
import { useState } from "react";
import { CreatePortfolioForm } from "./CreatePortfolioForm";
import { SignInForm } from "./SignInForm";

interface Props {
  slug: string;
}

export function PortfolioPage({ slug }: Props) {
  // TODO: Modals manager.
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatePortfolioFormOpen, setIsCreatePortfolioFormOpen] = useState(false);

  const { user, isLoading, error } = db.useAuth();

  const portfoliosQuery = db.useQuery(
    user
      ? {
          portfolios: {
            $: {
              where: {
                slug,
              },
            },
          },
        }
      : null,
  );

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

  if (
    portfoliosQuery.isLoading ||
    portfoliosQuery.error ||
    myPortfoliosQuery.isLoading ||
    myPortfoliosQuery.error
  ) {
    return null;
  }

  if (portfoliosQuery.data.portfolios.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto">
      <NavigationMenu className="my-4">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/docs">Chatfolio</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            {!user ? (
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Sign In</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <SignInForm onClose={() => setIsOpen(false)} />
                </DialogContent>
              </Dialog>
            ) : !myPortfoliosQuery.data?.portfolios.length ? (
              <Dialog open={isCreatePortfolioFormOpen} onOpenChange={setIsCreatePortfolioFormOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Create Portfolio</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <CreatePortfolioForm onClose={() => setIsCreatePortfolioFormOpen(false)} />
                </DialogContent>
              </Dialog>
            ) : (
              <Button size="sm" asChild>
                <Link href={`/${myPortfoliosQuery.data.portfolios[0].slug}`}>My Portfolio</Link>
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
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <Card className="p-8">
            <h3 className="mb-1 scroll-m-20 text-2xl font-semibold tracking-tight">
              {portfoliosQuery.data.portfolios[0].name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {portfoliosQuery.data.portfolios[0].about}
            </p>
          </Card>
        </div>
        <div className="col-span-8">
          <Card className="p-8">
            <div>TODO: Chat</div>
            <div>
              Visitor: Tell me about Andy&apos;s biggest achievements, side projects, and work
              experience.
            </div>
            <div>ChatGPT: ...</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
