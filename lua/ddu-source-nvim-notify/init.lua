local M = {}

M.open = function(id)
  local notify = require('notify')
  local notification = nil
  local notifications = notify.history()

  for _, v in ipairs(notifications) do
    if v.id == id then
      notification = v
      break
    end
  end

  local opened_buffer = notify.open(notification)

  local lines = vim.opt.lines:get()
  local cols = vim.opt.columns:get()

  local win = vim.api.nvim_open_win(opened_buffer.buffer, true, {
    relative = 'editor',
    row = (lines - opened_buffer.height) / 2,
    col = (cols - opened_buffer.width) / 2,
    height = opened_buffer.height,
    width = opened_buffer.width,
    border = 'rounded',
    style = 'minimal',
  })
  vim.fn.setwinvar(
    win,
    '&winhl',
    'Normal:' .. opened_buffer.highlights.body .. ',FloatBorder:' .. opened_buffer.highlights.border
  )
  vim.fn.setwinvar(win, '&wrap', 0)
end

M.preview = function(id, width)
  local notify = require('notify')
  local notification = nil
  local notifications = notify.history()

  for _, v in ipairs(notifications) do
    if v.id == id then
      notification = v
      break
    end
  end

  local opened_buffer = notify.open(notification, { max_width = width })
  return opened_buffer.buffer
end

return M
