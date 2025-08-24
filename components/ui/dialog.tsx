"use client";

import React, { useState, createContext, useContext, useRef, useEffect } from 'react';

type DialogContextType = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useDialog must be used within a Dialog");
  return context;
};

const Dialog = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return <DialogContext.Provider value={{ isOpen, onOpenChange: setIsOpen }}>{children}</DialogContext.Provider>;
};

const DialogTrigger = ({ children, asChild = false }: { children: React.ReactElement; asChild?: boolean }) => {
  const { onOpenChange } = useDialog();
  if (asChild) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, { onClick: () => onOpenChange(true) });
  }
  return <button onClick={() => onOpenChange(true)}>{children}</button>;
};

const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { isOpen, onOpenChange } = useDialog();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onOpenChange(false);
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4" onClick={() => onOpenChange(false)}>
      <div ref={ref} className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-md ${className}`} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
};

const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={`mb-4 ${className}`}>{children}</div>;
const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
const DialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;
const DialogFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={`mt-6 flex justify-end gap-2 ${className}`}>{children}</div>;

const DialogClose = ({ children, asChild = false }: { children: React.ReactElement; asChild?: boolean }) => {
  const { onOpenChange } = useDialog();
  if (asChild) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, { onClick: () => onOpenChange(false) });
  }
  return <button onClick={() => onOpenChange(false)}>{children}</button>;
};

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose };