"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCardSchema, type CreateCardInput } from "../schema";
import { useCreateCard } from "../hooks/use-cards";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

export const CreateCardDialog = ({trigger}:{trigger?:React.ReactElement}) => {
  const [open, setOpen] = useState(false);
  const createCard = useCreateCard();

  const form = useForm<CreateCardInput>({
    resolver: zodResolver(CreateCardSchema),
    defaultValues: { front: "", back: "", category: "", tags: [] },
  });

  const onSubmit = (values: CreateCardInput) => {
    createCard.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger
        render={
          trigger ?? (
            <Button>
              <Plus className="size-4" />
              New card
            </Button>
          )
        }
      />
       
     
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a card</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="front"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Front (question / prompt)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why use cursor pagination over offset?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="back"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Back (answer / explanation)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Because it stays O(1) regardless of scroll depth..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="prisma, trpc, postgres..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={createCard.isPending}>
                {createCard.isPending ? "Saving..." : "Save card"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};