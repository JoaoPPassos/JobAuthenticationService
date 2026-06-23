export type AccountConfirmationTemplateData = {
  name: string;
  confirmationUrl: string;
  appName?: string;
};

export type PasswordResetTemplateData = {
  name: string;
  code: string;
  appName?: string;
};

export interface IEmailTemplateService {
  mapAccountConfirmationTemplate(data: AccountConfirmationTemplateData): string;
  mapPasswordResetTemplate(data: PasswordResetTemplateData): string;
}
