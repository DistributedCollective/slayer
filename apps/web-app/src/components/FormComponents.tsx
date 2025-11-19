import { useStore } from '@tanstack/react-form';

import { useFieldContext, useFormContext } from '../hooks/app-form-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as ShadcnSelect from '@/components/ui/select';
import { Slider as ShadcnSlider } from '@/components/ui/slider';
import { Switch as ShadcnSwitch } from '@/components/ui/switch';
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea';
import { Decimal } from '@sovryn/slayer-shared';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import type { GetBalanceData } from 'wagmi/query';
import { Field, FieldDescription, FieldError, FieldLabel } from './ui/field';

export function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext();
  return (
    <form.Subscribe
      selector={(state) => [state.isSubmitting, state.isFormValid]}
    >
      {([isSubmitting, isFormValid]) => (
        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          form={form.formId()}
        >
          <Loader2Icon
            className={`mr-2 h-4 w-4 animate-spin ${isSubmitting ? '' : 'hidden'}`}
          />
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}

function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>;
}) {
  return (
    <>
      {errors.map((error) => (
        <FieldError
          key={typeof error === 'string' ? error : error.message}
          className="text-red-500 mt-1 font-bold"
        >
          {typeof error === 'string' ? error : error.message}
        </FieldError>
      ))}
    </>
  );
}

export function TextField({
  label,
  placeholder,
  description,
}: {
  label: string;
  placeholder?: string;
  description?: string;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <FieldLabel htmlFor={label}>{label}</FieldLabel>
      <Input
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  );
}

export function TextArea({
  label,
  rows = 3,
  description,
}: {
  label: string;
  rows?: number;
  description?: string;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <FieldLabel htmlFor={label}>{label}</FieldLabel>
      <ShadcnTextarea
        id={label}
        value={field.state.value}
        onBlur={field.handleBlur}
        rows={rows}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  );
}

export function Select({
  label,
  values,
  placeholder,
  description,
}: {
  label: string;
  values: Array<{ label: string; value: string }>;
  placeholder?: string;
  description?: string;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <FieldLabel htmlFor={label}>{label}</FieldLabel>
      <ShadcnSelect.Select
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
      >
        <ShadcnSelect.SelectTrigger className="w-full">
          <ShadcnSelect.SelectValue placeholder={placeholder} />
        </ShadcnSelect.SelectTrigger>
        <ShadcnSelect.SelectContent>
          <ShadcnSelect.SelectGroup>
            <ShadcnSelect.SelectLabel>{label}</ShadcnSelect.SelectLabel>
            {values.map((value) => (
              <ShadcnSelect.SelectItem key={value.value} value={value.value}>
                {value.label}
              </ShadcnSelect.SelectItem>
            ))}
          </ShadcnSelect.SelectGroup>
        </ShadcnSelect.SelectContent>
      </ShadcnSelect.Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  );
}

export function Slider({
  label,
  description,
}: {
  label: string;
  description?: string;
}) {
  const field = useFieldContext<number>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <FieldLabel htmlFor={label}>{label}</FieldLabel>
      <ShadcnSlider
        id={label}
        onBlur={field.handleBlur}
        value={[field.state.value]}
        onValueChange={(value) => field.handleChange(value[0])}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  );
}

export function Switch({
  label,
  description,
}: {
  label: string;
  description?: string;
}) {
  const field = useFieldContext<boolean>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <div className="flex items-center gap-2">
        <ShadcnSwitch
          id={label}
          onBlur={field.handleBlur}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(checked)}
        />
        <FieldLabel htmlFor={label}>{label}</FieldLabel>
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  );
}

const tryDecimalValue = (input: string): string => {
  try {
    if (input) {
      const decimalValue = Decimal.from(input);
      return decimalValue.toString();
    }
    return '';
  } catch {
    return '';
  }
};

export function AmountField({
  label,
  placeholder,
  description,
  balance,
}: {
  label: string;
  placeholder?: string;
  description?: string;
  balance?: GetBalanceData;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  const [renderedValue, setRenderedValue] = useState<string>(
    tryDecimalValue(field.state.value),
  );

  const handleChange = (input: string) => {
    setRenderedValue(input);
    field.handleChange(tryDecimalValue(input));
  };

  return (
    <Field>
      <FieldLabel htmlFor={label}>
        {label}

        {balance && (
          <span className="ml-2 text-sm font-normal text-gray-400">
            (Balance:{' '}
            {Decimal.from(balance.value, balance.decimals).toFormatted(88)}{' '}
            {balance.symbol})
          </span>
        )}
      </FieldLabel>
      <Input
        value={renderedValue}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => handleChange(e.target.value)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  );
}
