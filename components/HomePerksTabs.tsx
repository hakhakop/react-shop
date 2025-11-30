"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HomePerksTabs() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-10 sm:py-12">
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Why shop with us
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Small store, premium care.
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
          Support, setup, and real people behind every order. Switch tabs to see how we help.
        </p>
      </div>

      <Tabs defaultValue="support" className="w-full">
        <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full max-w-xl">
          <TabsTrigger value="support">Fast support</TabsTrigger>
          <TabsTrigger value="setup">Device setup</TabsTrigger>
          <TabsTrigger value="payments">Safe payments</TabsTrigger>
        </TabsList>

        <div className="mt-4 sm:mt-6">
          <TabsContent value="support">
            <Card className="border border-border/70">
              <CardHeader>
                <CardTitle>Fast, human support</CardTitle>
                <CardDescription>
                  We don&apos;t send you to bots. You get real help for your devices and orders.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-muted-foreground max-w-md">
                  Remote help, quick diagnostics and clear answers.  
                  Ideal for offices that don&apos;t have their own IT.
                </p>
                <Button size="sm" variant="default">
                  Contact support
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup">
            <Card className="border border-border/70">
              <CardHeader>
                <CardTitle>Software & device setup</CardTitle>
                <CardDescription>
                  We install, tune and prepare your tools so you can just start working.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-muted-foreground max-w-md">
                  From Office & design tools to full workstations —  
                  we make them fast, clean and ready to use.
                </p>
                <Button size="sm" variant="outline">
                  View services
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="border border-border/70">
              <CardHeader>
                <CardTitle>Transparent payments</CardTitle>
                <CardDescription>
                  Clear prices in AMD, no hidden “service fees” and trusted gateways.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-muted-foreground max-w-md">
                  Pay online or by invoice.  
                  Everything is documented — ideal for companies and accountants.
                </p>
                <Button size="sm" variant="ghost">
                  Learn more
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}