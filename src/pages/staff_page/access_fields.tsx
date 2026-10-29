import { useWatch } from 'react-hook-form';
import useAuthStore from '@/store/auth_store';
import type FormComponentProps from '@/types/form_component_props';
import type Role from '@/types/role';
import CheckList from '@/ui/check_list';
import Tabs from '@/ui/tabs';
import fieldError from '@/utils/field_error';

const SCOPES = [
  { value: 'all', label: 'All branches' },
  { value: 'list', label: 'Some branches' },
];

/** Which roles someone has and where they work. Only an owner can make someone an owner. */
export default function AccessFields({ roles, register, errors, control }: FormComponentProps & { roles: Role[] }) {
  const workplace = useAuthStore((state) => state.me?.workplace);
  const scope = useWatch({ control, name: 'branchScope' });
  const roleOptions = roles.filter((role) => role.key !== 'owner' || workplace?.isOwner).map((role) => ({ value: role._id, label: role.key === 'owner' ? 'Owner (everything)' : role.name, hint: role.description }));

  return (
    <>
      <CheckList label="Roles" hint="Pick one or more. What they can do adds up." options={roleOptions} {...register('roleIds')} error={fieldError(errors, 'roleIds')} />
      <Tabs options={SCOPES} {...register('branchScope')} />
      {scope === 'list' && (
        <CheckList label="Works at" options={(workplace?.branches ?? []).map((branch) => ({ value: branch._id, label: branch.name }))} {...register('branchIds')} error={fieldError(errors, 'branchIds')} />
      )}
    </>
  );
}
