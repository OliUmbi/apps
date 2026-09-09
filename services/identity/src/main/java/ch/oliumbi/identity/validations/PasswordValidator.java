package ch.oliumbi.identity.validations;

import ch.oliumbi.identity.services.PasswordService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    private final PasswordService passwordService;

    public PasswordValidator(PasswordService passwordService) {
        this.passwordService = passwordService;
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        return password == null || passwordService.meetsRequirements(password);
    }
}
