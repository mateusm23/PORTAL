const TRADUCOES: Array<[string, string]> = [
  ["User already registered", "Este email já está cadastrado."],
  ["Invalid login credentials", "Email ou senha incorretos."],
  ["Password should be at least", "A senha precisa ter pelo menos 6 caracteres."],
  ["Unable to validate email address", "Esse email não é válido."],
  ["Email rate limit exceeded", "Muitos emails enviados em pouco tempo. Espera um pouco e tenta de novo."],
  ["For security purposes", "Espera um pouco antes de tentar de novo."],
  ["Signups not allowed", "Cadastro não permitido no momento."],
  ["Email not confirmed", "Email ainda não confirmado."],
];

export function traduzErroAuth(mensagem: string): string {
  const encontrada = TRADUCOES.find(([chave]) =>
    mensagem.toLowerCase().includes(chave.toLowerCase()),
  );

  return encontrada?.[1] ?? "Não foi possível completar essa ação. Tente novamente.";
}
