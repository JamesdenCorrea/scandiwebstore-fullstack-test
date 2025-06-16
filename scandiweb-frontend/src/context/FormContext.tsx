import React, { createContext, useContext, useState } from 'react';

type FormContextType = {
  isFormOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
};

const FormContext = createContext<FormContextType>({
  isFormOpen: false,
  openForm: () => {},
  closeForm: () => {},
});

export const useFormContext = () => useContext(FormContext);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  return (
    <FormContext.Provider value={{ isFormOpen, openForm, closeForm }}>
      {children}
    </FormContext.Provider>
  );
};