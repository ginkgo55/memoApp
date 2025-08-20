"use client";

import { useState, useTransition } from "react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../../ui/dialog";
import { deleteMemoAction } from "@/lib/actions/memoActions";

type DeleteMemoButtonProps = {
  memoId: string;
};

export default function DeleteMemoButton({ memoId }: DeleteMemoButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteMemoAction(memoId);
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">削除</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>本当に削除しますか？</DialogTitle>
          <DialogDescription>削除すると復元はできません。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button variant="secondary" disabled={isPending}>やめる</Button></DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>{isPending ? "Deleting..." : "Delete"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}