import React, { useState, useCallback } from "react";
import * as yup from "yup";

export interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string | undefined>;
  validationSchema?: yup.ObjectSchema<any>;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  validationSchema,
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValue(field, value);
  }, [setValue]);

  const setFieldTouched = useCallback((field: keyof T, touchedValue = true) => {
    setTouched((prev) => ({ ...prev, [field]: touchedValue }));
  }, []);

  const validateField = useCallback(async (field: keyof T): Promise<boolean> => {
    let fieldError: string | undefined;

    if (validationSchema) {
      try {
        await validationSchema.validateAt(field as string, values);
      } catch (err: any) {
        fieldError = err.message;
      }
    } else if (validate) {
      const validationErrors = validate(values);
      fieldError = validationErrors[field as string];
    }

    if (fieldError) {
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
      return false;
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    }
  }, [values, validate, validationSchema]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    let isValid = true;
    const newErrors: FormErrors<T> = {};

    if (validationSchema) {
      try {
        await validationSchema.validate(values, { abortEarly: false });
      } catch (err: any) {
        if (err.inner) {
          err.inner.forEach((error: yup.ValidationError) => {
            if (error.path) {
              newErrors[error.path as keyof T] = error.message;
            }
          });
        }
        isValid = false;
      }
    } else if (validate) {
      const validationErrors = validate(values);
      Object.keys(validationErrors).forEach((key) => {
        const error = validationErrors[key];
        if (error) {
          newErrors[key as keyof T] = error;
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validate, validationSchema]);

  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => void | Promise<void>) => {
      const isValid = await validateForm();
      if (isValid) {
        await onSubmit(values);
      }
    },
    [values, validateForm]
  );

  const onSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => {
      return (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(onSubmit);
      };
    },
    [handleSubmit]
  );

  const getInputProps = useCallback(
    (field: keyof T) => {
      return {
        value: values[field] ?? "",
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
          setValue(field, e.target.value);
        },
        onBlur: () => {
          setFieldTouched(field, true);
          validateField(field);
        },
        error: touched[field] ? errors[field] : undefined,
      };
    },
    [values, touched, errors, setValue, setFieldTouched, validateField]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValues,
    setErrors,
    setValue,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    handleSubmit,
    onSubmit,
    getInputProps,
    reset,
  };
};

