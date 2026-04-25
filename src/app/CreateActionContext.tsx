import { createContext, useContext } from 'react';

type CreateActionContextValue = {
  openCreateSheet: () => void;
};

const CreateActionContext = createContext<CreateActionContextValue | null>(null);

export function CreateActionProvider({
  children,
  openCreateSheet,
}: {
  children: React.ReactNode;
  openCreateSheet: () => void;
}) {
  return (
    <CreateActionContext.Provider value={{ openCreateSheet }}>
      {children}
    </CreateActionContext.Provider>
  );
}

export function useCreateAction() {
  const context = useContext(CreateActionContext);

  if (!context) {
    return {
      openCreateSheet: () => {},
    };
  }

  return context;
}