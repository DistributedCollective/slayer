import { createFormHook } from '@tanstack/react-form';

import {
  AmountField,
  Select,
  SubscribeButton,
  TextArea,
  TextField,
} from '../components/FormComponents';
import { fieldContext, formContext } from './app-form-context';

export const { useAppForm } = createFormHook({
  fieldComponents: {
    AmountField,
    TextField,
    Select,
    TextArea,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
});
