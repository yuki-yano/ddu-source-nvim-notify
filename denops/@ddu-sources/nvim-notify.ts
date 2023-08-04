import { Denops } from "https://deno.land/x/denops_core@v5.0.0/mod.ts";
import { BaseSource, Item } from "https://deno.land/x/ddu_vim@v3.4.5/types.ts";
import { ActionData, Notification } from "../@ddu-kinds/nvim-notify.ts";

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
          const timeCol = 1;
          const titleCol = timeCol + log.title[1].length + 1;
          const iconCol = titleCol + log.title[0].length + 1;
          const levelCol = iconCol + log.icon.length + 3;
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
                  width: log.title[1].length,
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
                  width: log.icon.length,
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
