import {
  ActionFlags,
  DduItem,
  PreviewContext,
  Previewer,
} from "https://deno.land/x/ddu_vim@v3.4.5/types.ts";
import { ActionArguments } from "https://deno.land/x/ddu_vim@v3.4.5/types.ts";
import { BaseKind } from "https://deno.land/x/ddu_vim@v3.4.5/types.ts";
import { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";

export type Notification = {
  icon: string;
  id: number;
  level: string; // TODO: enum
  message: Array<string>;
  render: unknown; // NOTE: funcref
  time: number;
  title: [text: string, time: string];
};

export type ActionData = {
  id: number;
  notification: Notification;
};

type Params = Record<string, never>;

export class Kind extends BaseKind<Params> {
  actions: Record<
    string,
    (args: ActionArguments<Params>) => Promise<ActionFlags>
  > = {
    open: async ({ denops, items }: ActionArguments<Params>) => {
      if (items.length > 1) {
        throw new Error("open action only supports single item");
      }

      const item = items[0];
      denops.call("luaeval", `require("ddu-source-nvim-notify").open(_A.id)`, {
        id: (item.action as ActionData).id,
      });

      return await Promise.resolve(ActionFlags.None);
    },
  };

  async getPreviewer(args: {
    denops: Denops;
    item: DduItem;
    previewContext: PreviewContext;
  }): Promise<Previewer | undefined> {
    const buf = (await args.denops.call(
      "luaeval",
      `require("ddu-source-nvim-notify").preview(_A.id, _A.width)`,
      {
        id: (args.item.action as ActionData).id,
        width: args.previewContext.width,
      }
    )) as number;

    return {
      kind: "buffer",
      useExisting: true,
      expr: buf,
    };
  }

  params(): Params {
    return {};
  }
}
