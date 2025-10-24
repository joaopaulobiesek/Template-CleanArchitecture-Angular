import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { debounceTime, distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';

@Component({
	selector: 'app-search-debounce',
	templateUrl: './search-debounce.component.html',
	styleUrls: ['./search-debounce.component.scss'],
	imports: [CommonModule, SelectModule, ReactiveFormsModule, InputTextModule]
})
export class SearchDebounceComponent implements OnInit, OnDestroy {

	@Input() placeholder: string = 'Pesquisar...';
	@Input() label: string = 'Pesquisar';
	@Input() hideLabel: boolean = false;
	@Input() ariaLabel?: string;
	@Input() debounceTime: number = 500;
	@Input() minLength: number = 0;
	@Input() initialValue: string = '';

	private _disabled: boolean = false;
	@Input()
	set disabled(value: boolean) {
		this._disabled = value;
		// Atualiza o estado do FormControl quando o Input mudar
		if (this.searchTextFg) {
			const control = this.searchTextFg.get('searchedText');
			if (value) {
				control?.disable();
			} else {
				control?.enable();
			}
		}
	}
	get disabled(): boolean {
		return this._disabled;
	}

	@Output() onSearchChange = new EventEmitter<string | null>();
	@Output() onFocus = new EventEmitter<void>();
	@Output() onBlur = new EventEmitter<void>();

	public searchTextFg: FormGroup;
	private destroy$ = new Subject<void>();

	constructor(private fb: FormBuilder) {
		this.searchTextFg = this.fb.group({
			searchedText: [{ value: '', disabled: this._disabled }]
		});
	}

	ngOnInit(): void {
		// Set initial value if provided
		if (this.initialValue) {
			this.searchTextFg.patchValue({ searchedText: this.initialValue });
		}

		if (this._disabled) {
			this.searchTextFg.get('searchedText')?.disable();
		}

		// Setup debounced search
		this.searchTextFg.get('searchedText')?.valueChanges
			.pipe(
				debounceTime(this.debounceTime),
				distinctUntilChanged(),
				filter(value => !value || value.length >= this.minLength),
				takeUntil(this.destroy$)
			)
			.subscribe(searchText => {
				this.onSearchChange.emit(searchText || '');
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	public clearSearch(): void {
		this.searchTextFg.patchValue({ searchedText: '' });
	}

	public setSearchValue(value: string): void {
		this.searchTextFg.patchValue({ searchedText: value });
	}

	public getCurrentValue(): string {
		return this.searchTextFg.get('searchedText')?.value || '';
	}

	// Event handlers for focus/blur if needed by parent
	public onFocusHandler(): void {
		this.onFocus.emit();
	}

	public onBlurHandler(): void {
		this.onBlur.emit();
	}

	public enable(): void {
		this.searchTextFg.get('searchedText')?.enable();
	}

	public disable(): void {
		this.searchTextFg.get('searchedText')?.disable();
	}
}