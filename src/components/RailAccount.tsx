"use client";

import {
  Avatar,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Button,
} from "@fluentui/react-components";
import { SignOut20Regular } from "@fluentui/react-icons";
import { sair } from "@/app/painel/actions";

export default function RailAccount({
  nome,
  email,
  versao,
  ultimoDeploy,
}: {
  nome: string;
  email: string;
  versao: string;
  ultimoDeploy: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3.5">
      <Menu positioning="after-bottom">
        <MenuTrigger disableButtonEnhancement>
          <Avatar name={nome || email} color="colorful" size={32} style={{ cursor: "pointer" }} />
        </MenuTrigger>
        <MenuPopover style={{ minWidth: 220 }}>
          <div className="mb-2.5 flex items-center gap-2.5 px-1 pt-1">
            <Avatar name={nome || email} color="colorful" size={32} />
            <p className="text-[13.5px] font-semibold text-slate-900">{nome}</p>
          </div>
          <p className="mb-2.5 border-b border-slate-100 px-1 pb-2.5 text-xs break-all text-slate-500">{email}</p>
          <MenuList>
            <MenuItem icon={<SignOut20Regular />} onClick={() => sair()}>
              Sair
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>

      <Popover positioning="after-bottom">
        <PopoverTrigger disableButtonEnhancement>
          <Button
            appearance="subtle"
            shape="rounded"
            size="small"
            style={{ fontSize: 11, color: "#94a3b8", backgroundColor: "#f1f5f9", minWidth: 0, padding: "2px 10px" }}
          >
            v{versao}
          </Button>
        </PopoverTrigger>
        <PopoverSurface style={{ width: 250 }}>
          <p className="mb-2.5 text-[12.5px] font-semibold text-slate-900">Desenvolvido por Mateus Monteiro</p>
          <div className="flex items-center justify-between py-1 text-xs text-slate-500">
            <span>Versão</span>
            <strong className="font-medium text-slate-900">{versao}</strong>
          </div>
          <div className="flex items-center justify-between py-1 text-xs text-slate-500">
            <span>Deploy</span>
            <strong className="font-medium text-slate-900">{ultimoDeploy}</strong>
          </div>
        </PopoverSurface>
      </Popover>
    </div>
  );
}
