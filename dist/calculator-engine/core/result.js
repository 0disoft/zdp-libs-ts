export function failure(code, field) {
    return field === undefined
        ? { ok: false, error: { code } }
        : { ok: false, error: { code, field } };
}
//# sourceMappingURL=result.js.map