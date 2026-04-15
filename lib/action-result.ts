export type ActionResult = { ok: true } | { ok: false; message: string };

export function actionOk(): ActionResult {
  return { ok: true };
}

export function actionErr(message: string): ActionResult {
  return { ok: false, message };
}
