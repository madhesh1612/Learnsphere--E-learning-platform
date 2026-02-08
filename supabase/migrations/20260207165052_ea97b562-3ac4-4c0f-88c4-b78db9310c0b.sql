-- LearnSphere eLearning Platform Database Schema

-- Create custom types
CREATE TYPE public.user_role AS ENUM ('admin', 'instructor', 'learner');
CREATE TYPE public.course_visibility AS ENUM ('everyone', 'signed_in');
CREATE TYPE public.course_access_rule AS ENUM ('open', 'invitation', 'payment');
CREATE TYPE public.lesson_type AS ENUM ('video', 'document', 'image', 'quiz');
CREATE TYPE public.enrollment_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.user_role NOT NULL DEFAULT 'learner',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responsible_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  visibility public.course_visibility DEFAULT 'everyone' NOT NULL,
  access_rule public.course_access_rule DEFAULT 'open' NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  is_published BOOLEAN DEFAULT false NOT NULL,
  views_count INTEGER DEFAULT 0 NOT NULL,
  total_duration INTEGER DEFAULT 0, -- in seconds
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  published_at TIMESTAMPTZ
);

-- Lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  lesson_type public.lesson_type NOT NULL DEFAULT 'video',
  content_url TEXT, -- Video URL (YouTube/Drive) or file URL
  duration INTEGER DEFAULT 0, -- in seconds
  allow_download BOOLEAN DEFAULT false,
  responsible_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Lesson attachments
CREATE TABLE public.lesson_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  external_url TEXT,
  attachment_type TEXT DEFAULT 'file', -- 'file' or 'link'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  first_try_points INTEGER DEFAULT 10,
  second_try_points INTEGER DEFAULT 7,
  third_try_points INTEGER DEFAULT 5,
  fourth_plus_try_points INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Quiz options (answers)
CREATE TABLE public.quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL
);

-- Course enrollments
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  status public.enrollment_status DEFAULT 'active' NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- User progress on lessons
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- Quiz attempts
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  attempt_number INTEGER DEFAULT 1 NOT NULL,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Quiz attempt answers (user's answers per question)
CREATE TABLE public.quiz_attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
  selected_option_id UUID REFERENCES public.quiz_options(id) ON DELETE CASCADE,
  is_correct BOOLEAN DEFAULT false NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User points
CREATE TABLE public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  required_points INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL
);

-- User badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- Course reviews and ratings
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, course_id)
);

-- Course invitations
CREATE TABLE public.course_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  invited_email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.invite_status DEFAULT 'pending' NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  accepted_at TIMESTAMPTZ
);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, required_points, sort_order) VALUES
  ('Newbie', 'Just getting started!', '🌱', 20, 1),
  ('Explorer', 'Exploring new knowledge', '🔍', 40, 2),
  ('Achiever', 'Making great progress', '🏆', 60, 3),
  ('Specialist', 'Becoming an expert', '⭐', 80, 4),
  ('Expert', 'Deep knowledge achieved', '💎', 100, 5),
  ('Master', 'Mastery level unlocked!', '👑', 120, 6);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_invites ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to check if user is course owner/instructor
CREATE OR REPLACE FUNCTION public.is_course_instructor(_course_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.courses
    WHERE id = _course_id
      AND instructor_id = auth.uid()
  )
$$;

-- Helper function to check if user can access course
CREATE OR REPLACE FUNCTION public.can_access_course(_course_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = _course_id
      AND (
        -- Admin or instructor can always access
        public.has_role(auth.uid(), 'admin')
        OR c.instructor_id = auth.uid()
        -- Check visibility and access rules
        OR (c.is_published = true AND c.visibility = 'everyone' AND c.access_rule = 'open')
        OR (c.is_published = true AND c.visibility = 'signed_in' AND auth.uid() IS NOT NULL AND c.access_rule = 'open')
        -- Check if enrolled
        OR EXISTS (
          SELECT 1 FROM public.enrollments e
          WHERE e.course_id = c.id AND e.user_id = auth.uid() AND e.status = 'active'
        )
        -- Check if invited
        OR EXISTS (
          SELECT 1 FROM public.course_invites ci
          JOIN public.profiles p ON p.email = ci.invited_email
          WHERE ci.course_id = c.id AND p.id = auth.uid() AND ci.status = 'accepted'
        )
      )
  )
$$;

-- Helper function to check if user is enrolled
CREATE OR REPLACE FUNCTION public.is_enrolled(_course_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments
    WHERE course_id = _course_id
      AND user_id = auth.uid()
      AND status = 'active'
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own learner role"
  ON public.user_roles FOR INSERT
  WITH CHECK (user_id = auth.uid() AND role = 'learner');

-- RLS Policies for courses
CREATE POLICY "Anyone can view published courses based on visibility"
  ON public.courses FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR instructor_id = auth.uid()
    OR (is_published = true AND visibility = 'everyone')
    OR (is_published = true AND visibility = 'signed_in' AND auth.uid() IS NOT NULL)
    OR public.is_enrolled(id)
  );

CREATE POLICY "Instructors and admins can create courses"
  ON public.courses FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'instructor')
  );

CREATE POLICY "Course owners and admins can update courses"
  ON public.courses FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR instructor_id = auth.uid()
  );

CREATE POLICY "Course owners and admins can delete courses"
  ON public.courses FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR instructor_id = auth.uid()
  );

-- RLS Policies for lessons
CREATE POLICY "Users can view lessons of accessible courses"
  ON public.lessons FOR SELECT
  USING (public.can_access_course(course_id));

CREATE POLICY "Course owners can manage lessons"
  ON public.lessons FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.is_course_instructor(course_id)
  );

-- RLS Policies for lesson_attachments
CREATE POLICY "Users can view attachments of accessible lessons"
  ON public.lesson_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = lesson_id AND public.can_access_course(l.course_id)
    )
  );

CREATE POLICY "Course owners can manage attachments"
  ON public.lesson_attachments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = lesson_id AND (
        public.has_role(auth.uid(), 'admin')
        OR public.is_course_instructor(l.course_id)
      )
    )
  );

-- RLS Policies for quizzes
CREATE POLICY "Users can view quizzes of accessible courses"
  ON public.quizzes FOR SELECT
  USING (public.can_access_course(course_id));

CREATE POLICY "Course owners can manage quizzes"
  ON public.quizzes FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.is_course_instructor(course_id)
  );

-- RLS Policies for quiz_questions
CREATE POLICY "Users can view questions of accessible quizzes"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_id AND public.can_access_course(q.course_id)
    )
  );

CREATE POLICY "Course owners can manage questions"
  ON public.quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_id AND (
        public.has_role(auth.uid(), 'admin')
        OR public.is_course_instructor(q.course_id)
      )
    )
  );

-- RLS Policies for quiz_options
CREATE POLICY "Users can view options of accessible quizzes"
  ON public.quiz_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON q.id = qq.quiz_id
      WHERE qq.id = question_id AND public.can_access_course(q.course_id)
    )
  );

CREATE POLICY "Course owners can manage options"
  ON public.quiz_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON q.id = qq.quiz_id
      WHERE qq.id = question_id AND (
        public.has_role(auth.uid(), 'admin')
        OR public.is_course_instructor(q.course_id)
      )
    )
  );

-- RLS Policies for enrollments
CREATE POLICY "Users can view own enrollments or course instructors can view theirs"
  ON public.enrollments FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.is_course_instructor(course_id)
  );

CREATE POLICY "Users can enroll in open courses"
  ON public.enrollments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id
        AND c.is_published = true
        AND c.access_rule = 'open'
    )
  );

CREATE POLICY "Admins and instructors can manage enrollments"
  ON public.enrollments FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.is_course_instructor(course_id)
  );

CREATE POLICY "Admins and instructors can delete enrollments"
  ON public.enrollments FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.is_course_instructor(course_id)
    OR user_id = auth.uid()
  );

-- RLS Policies for lesson_progress
CREATE POLICY "Users can view own progress or instructors can view"
  ON public.lesson_progress FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = lesson_id AND public.is_course_instructor(l.course_id)
    )
  );

CREATE POLICY "Users can manage own progress"
  ON public.lesson_progress FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view own attempts or instructors can view"
  ON public.quiz_attempts FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_id AND public.is_course_instructor(q.course_id)
    )
  );

CREATE POLICY "Users can create own attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own attempts"
  ON public.quiz_attempts FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for quiz_attempt_answers
CREATE POLICY "Users can view own answers"
  ON public.quiz_attempt_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      WHERE qa.id = attempt_id AND qa.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can manage own answers"
  ON public.quiz_attempt_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      WHERE qa.id = attempt_id AND qa.user_id = auth.uid()
    )
  );

-- RLS Policies for user_points
CREATE POLICY "Users can view own points"
  ON public.user_points FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage own points"
  ON public.user_points FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for badges
CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage badges"
  ON public.badges FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_badges
CREATE POLICY "Users can view badges"
  ON public.user_badges FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can award badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Enrolled users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_enrolled(course_id)
  );

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for course_invites
CREATE POLICY "Course owners can view invites"
  ON public.course_invites FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.is_course_instructor(course_id)
    OR invited_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.email = invited_email
    )
  );

CREATE POLICY "Course owners can create invites"
  ON public.course_invites FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.is_course_instructor(course_id)
  );

CREATE POLICY "Course owners can update invites"
  ON public.course_invites FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.is_course_instructor(course_id)
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.email = invited_email
    )
  );

CREATE POLICY "Course owners can delete invites"
  ON public.course_invites FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.is_course_instructor(course_id)
  );

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Create user_points record
  INSERT INTO public.user_points (user_id, total_points)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update course duration when lessons change
CREATE OR REPLACE FUNCTION public.update_course_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.courses
  SET total_duration = (
    SELECT COALESCE(SUM(duration), 0)
    FROM public.lessons
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_lesson_change
  AFTER INSERT OR UPDATE OR DELETE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_course_duration();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create storage bucket for course content
INSERT INTO storage.buckets (id, name, public) VALUES ('course-content', 'course-content', true);

-- Storage policies for course content
CREATE POLICY "Anyone can view course content"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-content');

CREATE POLICY "Authenticated users can upload course content"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'course-content'
    AND auth.uid() IS NOT NULL
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'instructor')
    )
  );

CREATE POLICY "Content owners can update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'course-content'
    AND auth.uid() IS NOT NULL
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'instructor')
    )
  );

CREATE POLICY "Content owners can delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'course-content'
    AND auth.uid() IS NOT NULL
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'instructor')
    )
  );