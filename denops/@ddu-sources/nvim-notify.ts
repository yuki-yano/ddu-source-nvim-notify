import { Denops } from "https://deno.land/x/denops_core@v5.0.0/mod.ts";
import { BaseSource, Item } from "https://deno.land/x/ddu_vim@v3.4.5/types.ts";
import { ActionData, Notification } from "../@ddu-kinds/nvim-notify.ts";
import * as fn from "https://deno.land/x/denops_std@v5.0.1/function/mod.ts";

type Params = Record<string, never>;

export class Source extends BaseSource<Params> {
  kind = "nvim-notify";

  gather(args: {
    denops: Denops;
    sourceParams: Params;
  }): ReadableStream<Array<Item<ActionData>>> {
    return new ReadableStream({
      async start(controller) {
        const logs = (await args.denops.call(
          "luaeval",
          'require("notify").history()',
        )) as Array<Notification>;

        for (const log of logs) {
          const time = log.title[1];
          const title = log.title[0];
          const iconWidth = await fn.strlen(args.denops, log.icon);

          const timeCol = 1;
          const titleCol = timeCol + time.length + 1;
          const iconCol = titleCol + title.length + 1;
          const levelCol = iconCol + iconWidth + 1;
          const messageCol = levelCol + log.level.length + 1;

          controller.enqueue([
            {
              word: `${log.title[1]} ${log.title[0]} ${log.icon} ${log.level} ${
                log.message[0]
              }`,
              highlights: [
                {
                  name: "Time",
                  hl_group: "NotifyLogTime",
                  col: timeCol,
                  width: time.length + 1,
                },
                {
                  name: "Title",
                  hl_group: "NotifyLogTitle",
                  col: titleCol,
                  width: log.title[0].length,
                },
                {
                  name: "Icon",
                  hl_group: `Notify${log.level}Title`,
                  col: iconCol,
                  width: iconWidth,
                },
                {
                  name: "Level",
                  hl_group: `Notify${log.level}Title`,
                  col: levelCol,
                  width: log.level.length,
                },
                {
                  name: "Message",
                  hl_group: `Notify${log.level}Body`,
                  col: messageCol,
                  width: log.message[0].length,
                },
              ],
              action: {
                id: log.id,
                notification: log,
              },
            },
          ]);
        }

        controller.close();
      },
    });
  }

  params(): Params {
    return {};
  }
}
