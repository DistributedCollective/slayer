import { createFormHook } from '@tanstack/react-form';

import {
  AmountField,
  CheckBox,
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
    CheckBox,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
});
