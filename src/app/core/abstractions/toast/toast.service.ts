import { HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private messageService = inject(MessageService);// constructor(private messageService: MessageService) { }

    showSuccess(summary: string, detail: string, key?: string) {
        this.messageService.add({  severity: 'success', summary: summary, detail: detail, life: 5_000, closable: false });
    }

    showInfo(summary: string, detail: string, key?: string) {
        this.messageService.add({  severity: 'info', summary: summary, detail: detail, life: 5_000, closable: false });
    }

    showWarn(summary: string, detail: string, key?: string) {
        this.messageService.add({  severity: 'warn', summary: summary, detail: detail, life: 5_000, closable: false });
    }

    showError(summary: string, detail: string, key?: string) {
        this.messageService.add({  severity: 'error', summary: summary, detail: detail, life: 5_000, closable: false });
    }

    showMessageResponse(
        arr: Array<any>,
        message?: {
            success?: {
                title?: string,
                description?: string
            },
            error?: {
                title?: string,
                description?: string
            }
        }
    ) {

        const [sucessRes, errorRes] = arr;
        
        if (errorRes) {
            const erroResponse = errorRes as HttpErrorResponse

            this.showError(message?.error?.title || "Erro", message?.error?.description || erroResponse?.error?.message);


            if (erroResponse?.error?.errors) {
                erroResponse?.error?.errors?.forEach((element: any) => {
                    this.showError(element?.key, element?.message);
                });
            }
        }

        if (sucessRes) {
            this.showSuccess(message?.success?.title || "Sucesso", message?.success?.description || "");
        }
    }

    clear(toastKey?: string) {
        if (toastKey)
            this.messageService.clear(toastKey);
        else
            this.messageService.clear();
    }
}