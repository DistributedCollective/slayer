import { useStore } from '@tanstack/react-form';

import { useFieldContext, useFormContext } from '../hooks/app-form-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as ShadcnSelect from '@/components/ui/select';
import { Slider as ShadcnSlider } from '@/components/ui/slider';
import { Switch as ShadcnSwitch } from '@/components/ui/switch';
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { Decimal } from '@sovryn/slayer-shared';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import type { GetBalanceData } from 'wagmi/query';
import { AmountRenderer } from './ui/amount-renderer';
import { Checkbox } from './ui/checkbox';
import { Field, FieldDescription, FieldError, FieldLabel } from './ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group';

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
          form={form.formId}
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
  label: ReactNode;
  placeholder?: string;
  description?: string;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
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
  label: ReactNode;
  rows?: number;
  description?: string;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <ShadcnTextarea
        id={field.name}
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
  label: ReactNode;
  values: Array<{ label: string; value: string }>;
  placeholder?: string;
  description?: string;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
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
  label: ReactNode;
  description?: string;
}) {
  const field = useFieldContext<number>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <ShadcnSlider
        id={field.name}
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
  label: ReactNode;
  description?: string;
}) {
  const field = useFieldContext<boolean>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <div className="flex items-center gap-2">
        <ShadcnSwitch
          id={field.name}
          onBlur={field.handleBlur}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(checked)}
        />
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  );
}

export function CheckBox({
  label,
  description,
}: {
  label: ReactNode;
  description?: string;
}) {
  const field = useFieldContext<CheckedState>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <div className="flex items-start gap-3">
        <Checkbox
          id={field.name}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(checked)}
          onBlur={field.handleBlur}
          className="mt-1"
        />
        <div className="grid gap-2">
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          {description && <FieldDescription>{description}</FieldDescription>}
        </div>
      </div>
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
  addonRight,
}: {
  label: ReactNode;
  placeholder?: string;
  description?: string;
  balance?: Omit<GetBalanceData, 'formatted'>;
  addonRight?: ReactNode;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  const [renderedValue, setRenderedValue] = useState<string>(
    tryDecimalValue(field.state.value),
  );

  const handleChange = (input: string) => {
    setRenderedValue(input);
    field.setValue(tryDecimalValue(input) as never, {
      dontRunListeners: true,
    });
  };

  useEffect(() => {
    const unsub = field.store.subscribe(({ prevVal, currentVal }) => {
      if (prevVal.value !== currentVal.value) {
        setRenderedValue(tryDecimalValue(currentVal.value));
      }
    });

    return unsub;
  }, []);

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>
        {balance ? (
          <>
            <div className="w-full flex flex-row gap-4 justify-between items-center">
              <span>{label}</span>
              <Button
                variant="link"
                size="sm"
                className="p-0"
                onClick={() => {
                  field.setValue(
                    Decimal.from(balance.value).toString(balance.decimals),
                  );
                }}
              >
                <span>
                  (max:&nbsp;
                  <AmountRenderer
                    value={Decimal.from(
                      balance.value,
                      balance.decimals,
                    ).toString()}
                    suffix={balance.symbol}
                    showApproxSign
                  />
                  )
                </span>
              </Button>
            </div>
          </>
        ) : (
          <>{label}</>
        )}
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={field.name}
          value={renderedValue}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          onChange={(e) => handleChange(e.target.value)}
          type="number"
          step="0.00001"
        />
        {addonRight && (
          <InputGroupAddon align="inline-end">{addonRight}</InputGroupAddon>
        )}
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </Field>
  );
}
