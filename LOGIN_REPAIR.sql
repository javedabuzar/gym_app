-- =============================================================
-- [FIX] LOGIN REPAIR SCRIPT
-- Use this if a new account cannot login or is stuck on approval.
-- =============================================================
-- 1. Copy this script.
-- 2. Go to Supabase Dashboard > SQL Editor.
-- 3. Replace 'USER_EMAIL_HERE' with the actual email address.
-- 4. Click RUN.
-- =============================================================

DO $$
DECLARE
    target_email TEXT := 'USER_EMAIL_HERE'; -- UPDATE THIS EMAIL
    user_uuid UUID;
BEGIN
    -- 1. Get the User ID from auth.users
    SELECT id INTO user_uuid FROM auth.users WHERE email = target_email;

    IF user_uuid IS NULL THEN
        RAISE NOTICE 'User with email % not found in auth.users!', target_email;
        RETURN;
    END IF;

    -- 2. Manually confirm the email (Bypass verification)
    UPDATE auth.users 
    SET email_confirmed_at = now(),
        confirmed_at = now(),
        last_sign_in_at = now()
    WHERE id = user_uuid;

    RAISE NOTICE 'Email confirmed for %', target_email;

    -- 3. Ensure admin_accounts entry exists and is FULLY APPROVED
    -- Check if it exists
    IF EXISTS (SELECT 1 FROM public.admin_accounts WHERE user_id = user_uuid) THEN
        UPDATE public.admin_accounts
        SET 
            approval_status = 'approved',
            payment_status = 'approved',
            is_active = true,
            updated_at = now()
        WHERE user_id = user_uuid;
        RAISE NOTICE 'Existing admin_account updated to APPROVED.';
    ELSE
        -- Create it if missing (using metadata if available, otherwise defaults)
        INSERT INTO public.admin_accounts (
            user_id, email, full_name, gym_name, plan_type, plan_price, 
            approval_status, payment_status, is_active
        )
        SELECT 
            id, email, 
            COALESCE(raw_user_meta_data ->> 'full_name', 'Gym Owner'),
            COALESCE(raw_user_meta_data ->> 'gym_name', 'New Gym'),
            COALESCE(raw_user_meta_data ->> 'plan_type', 'monthly'),
            COALESCE((raw_user_meta_data ->> 'plan_price')::numeric, 5000),
            'approved', 'approved', true
        FROM auth.users
        WHERE id = user_uuid;
        RAISE NOTICE 'New admin_account created and APPROVED.';
    END IF;

END $$;
