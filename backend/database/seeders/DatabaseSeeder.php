<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Category;
use App\Models\Company;
use App\Models\JobPost;
use App\Models\User;
use App\Notifications\ApplicationReceived;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /** Demo data: every account uses the password "password". */
    public function run(): void
    {
        User::factory()->admin()->create(['name' => 'Platform Admin', 'email' => 'admin@jobs.test']);

        $categories = collect([
            'Software Development', 'Design', 'Marketing', 'Data & Analytics',
            'Customer Support', 'Sales', 'Finance & Accounting', 'Human Resources',
        ])->mapWithKeys(fn (string $name) => [$name => Category::create(['name' => $name])]);

        $companies = collect($this->companies())->map(function (array $row, int $i) {
            $owner = User::factory()->create([
                'name' => $row['contact'],
                'email' => $i === 0 ? 'company@jobs.test' : 'hr'.$i.'@jobs.test',
                'role' => User::ROLE_COMPANY,
                'location' => $row['location'],
            ]);

            return Company::create([
                'user_id' => $owner->id,
                'name' => $row['name'],
                'website' => $row['website'],
                'location' => $row['location'],
                'industry' => $row['industry'],
                'size' => $row['size'],
                'description' => $row['description'],
            ]);
        });

        foreach ($this->jobs() as $i => $row) {
            JobPost::create([
                'company_id' => $companies[$row['company']]->id,
                'category_id' => $categories[$row['category']]->id,
                'title' => $row['title'],
                'description' => $row['description'],
                'requirements' => $row['requirements'],
                'location' => $row['location'] ?? $companies[$row['company']]->location,
                'type' => $row['type'] ?? 'full_time',
                'work_mode' => $row['mode'],
                'experience_level' => $row['level'],
                'salary_min' => $row['salary'][0],
                'salary_max' => $row['salary'][1],
                'skills' => $row['skills'],
                'status' => $row['status'] ?? 'open',
                'deadline' => now()->addDays(14 + ($i * 3) % 40)->toDateString(),
                'created_at' => now()->subDays($i)->subHours($i * 3),
                'updated_at' => now()->subDays($i),
            ]);
        }

        $this->seedSeekersAndApplications();
    }

    private function seedSeekersAndApplications(): void
    {
        // One small shared sample file stands in for every demo resume.
        $resume = 'resumes/demo/sample-resume.pdf';
        Storage::disk('local')->put($resume, $this->samplePdf());

        $profiles = [
            ['Sara Haddad', 'seeker@jobs.test', 'Full-Stack Developer (Laravel & React)', ['PHP', 'Laravel', 'React', 'MySQL', 'Tailwind CSS']],
            ['Omar Khalil', 'omar@jobs.test', 'Front-End Developer', ['React', 'TypeScript', 'Tailwind CSS', 'Figma']],
            ['Lina Mansour', 'lina@jobs.test', 'UI/UX Designer', ['Figma', 'Design Systems', 'Prototyping']],
            ['Yousef Nasser', 'yousef@jobs.test', 'Back-End Developer', ['PHP', 'Laravel', 'PostgreSQL', 'Redis', 'Docker']],
            ['Maya Saleh', 'maya@jobs.test', 'Digital Marketing Specialist', ['SEO', 'Google Ads', 'Content Strategy']],
            ['Karim Aziz', 'karim@jobs.test', 'Data Analyst', ['SQL', 'Python', 'Power BI', 'Excel']],
            ['Nour Hamdan', 'nour@jobs.test', 'Customer Support Specialist', ['Zendesk', 'Communication', 'English']],
            ['Tarek Zein', 'tarek@jobs.test', 'Junior Web Developer', ['HTML', 'CSS', 'JavaScript', 'PHP']],
        ];

        $seekers = collect($profiles)->map(fn (array $p) => User::factory()->create([
            'name' => $p[0],
            'email' => $p[1],
            'headline' => $p[2],
            'skills' => $p[3],
            'phone' => '+963 9'.fake()->numerify('## ### ###'),
            'location' => fake()->randomElement(['Damascus', 'Aleppo', 'Homs', 'Latakia', 'Remote']),
            'bio' => 'I enjoy building things people use every day and I am looking for a team where I can keep learning.',
            'resume_path' => $resume,
        ]));

        $statuses = ['pending', 'pending', 'reviewed', 'pending', 'shortlisted', 'rejected', 'accepted'];
        $jobs = JobPost::with('company.user')->where('status', 'open')->orderBy('id')->get();

        foreach ($jobs as $j => $job) {
            // The demo seeker (index 0) is skipped on the first jobs so there is something left to apply to.
            $applicants = $seekers->filter(fn (User $u, int $s) => ($s + $j) % 3 === 0 && ! ($s === 0 && $j < 6));

            foreach ($applicants as $s => $seeker) {
                $application = Application::create([
                    'job_post_id' => $job->id,
                    'user_id' => $seeker->id,
                    'cover_letter' => "Hello {$job->company->name} team,\n\nI am interested in the {$job->title} role. My background as a {$seeker->headline} matches what you are looking for, and I would be glad to talk about how I can help.\n\nBest regards,\n{$seeker->name}",
                    'resume_path' => $resume,
                    'resume_name' => str($seeker->name)->slug().'-resume.pdf',
                    'status' => $statuses[($s + 2 * $j) % count($statuses)],
                    'created_at' => now()->subHours(($j * 5 + $s * 2) % 96 + 1),
                ]);

                // Unread notifications for the newest applications, so the bell is not empty on first login.
                if ($application->status === 'pending') {
                    $job->company->user->notify(new ApplicationReceived($application));
                }
            }
        }
    }

    private function companies(): array
    {
        return [
            ['name' => 'Cedar Tech', 'contact' => 'Rami Barakat', 'location' => 'Damascus', 'industry' => 'Software', 'size' => '11-50', 'website' => 'https://cedartech.example',
                'description' => 'Cedar Tech builds web and mobile products for retailers and logistics companies across the region. We are a small product team that ships every week.'],
            ['name' => 'Bluewave Commerce', 'contact' => 'Hala Darwish', 'location' => 'Dubai', 'industry' => 'E-commerce', 'size' => '51-200', 'website' => 'https://bluewave.example',
                'description' => 'Bluewave runs an online marketplace for home goods, serving customers in six countries with same-week delivery.'],
            ['name' => 'Northfield Analytics', 'contact' => 'Sami Yacoub', 'location' => 'Amman', 'industry' => 'Data', 'size' => '11-50', 'website' => 'https://northfield.example',
                'description' => 'Northfield helps mid-sized companies turn their sales and operations data into dashboards people actually use.'],
            ['name' => 'Olive Studio', 'contact' => 'Dana Issa', 'location' => 'Beirut', 'industry' => 'Design', 'size' => '1-10', 'website' => 'https://olivestudio.example',
                'description' => 'Olive Studio is a design studio focused on brand identity and product design for startups.'],
            ['name' => 'Mada Finance', 'contact' => 'Fadi Qasem', 'location' => 'Riyadh', 'industry' => 'Fintech', 'size' => '201-500', 'website' => 'https://madafinance.example',
                'description' => 'Mada Finance offers digital payment and invoicing tools for small businesses.'],
            ['name' => 'Bright Path Academy', 'contact' => 'Rana Suleiman', 'location' => 'Remote', 'industry' => 'Education', 'size' => '11-50', 'website' => 'https://brightpath.example',
                'description' => 'Bright Path is an online academy that teaches programming and design in Arabic and English.'],
        ];
    }

    private function jobs(): array
    {
        $dev = 'Software Development';

        return [
            ['company' => 0, 'category' => $dev, 'title' => 'Full-Stack Developer (Laravel & React)', 'mode' => 'hybrid', 'level' => 'mid', 'salary' => [1200, 1800], 'skills' => ['PHP', 'Laravel', 'React', 'MySQL', 'REST API'],
                'description' => "You will build and maintain features across our Laravel API and React front end, from database design to the final screen.\n\nYou will work with a product manager and a designer in two-week cycles, review other developers' code, and help keep the test suite healthy.",
                'requirements' => "- 2+ years with PHP and Laravel\n- Solid React and JavaScript/TypeScript\n- Comfortable with MySQL and writing migrations\n- Experience building and consuming REST APIs\n- Git and code review as a daily habit"],
            ['company' => 0, 'category' => $dev, 'title' => 'Junior Laravel Developer', 'mode' => 'onsite', 'level' => 'junior', 'salary' => [600, 900], 'skills' => ['PHP', 'Laravel', 'MySQL', 'Git'],
                'description' => "A first role for someone who has built projects with Laravel and wants to grow inside a team.\n\nYou will start with bug fixes and small features, paired with a senior developer, and take on larger tasks as you settle in.",
                'requirements' => "- A portfolio or GitHub with at least one Laravel project\n- Good understanding of MVC, Eloquent and routing\n- Basic SQL\n- Willingness to ask questions and learn"],
            ['company' => 0, 'category' => $dev, 'title' => 'React Front-End Developer', 'mode' => 'remote', 'level' => 'mid', 'salary' => [1100, 1700], 'skills' => ['React', 'TypeScript', 'Tailwind CSS', 'TanStack Query'],
                'description' => "Own the front end of our logistics dashboard: tables with heavy filtering, live order tracking and a design system shared across three apps.",
                'requirements' => "- 2+ years building production React apps\n- TypeScript\n- Experience with data fetching and caching libraries\n- An eye for detail in spacing, states and accessibility"],
            ['company' => 0, 'category' => $dev, 'title' => 'Mobile Developer (Flutter)', 'mode' => 'hybrid', 'level' => 'mid', 'salary' => [1100, 1600], 'skills' => ['Flutter', 'Dart', 'REST API', 'Firebase'],
                'description' => "Build the driver and customer apps that sit on top of our delivery platform, working closely with the back-end team on the API.",
                'requirements' => "- At least one published Flutter app\n- State management with Bloc or Riverpod\n- Experience integrating REST APIs and push notifications"],
            ['company' => 0, 'category' => 'Customer Support', 'title' => 'Technical Support Specialist', 'mode' => 'onsite', 'level' => 'junior', 'salary' => [450, 700], 'skills' => ['Communication', 'Troubleshooting', 'English'],
                'description' => "Be the first point of contact for our clients: answer questions, reproduce problems, and pass clear bug reports to the development team.",
                'requirements' => "- Clear written Arabic and English\n- Patience and a structured way of investigating problems\n- Basic understanding of how web applications work"],
            ['company' => 1, 'category' => $dev, 'title' => 'Senior Back-End Engineer (PHP)', 'mode' => 'remote', 'level' => 'senior', 'salary' => [2800, 4000], 'skills' => ['PHP', 'Laravel', 'MySQL', 'Redis', 'AWS'],
                'description' => "Lead the work on our order and inventory services, which process tens of thousands of orders a day. You will design APIs, improve query performance and mentor two mid-level engineers.",
                'requirements' => "- 5+ years of back-end development, mostly PHP\n- Deep knowledge of MySQL indexing and transactions\n- Queues, caching and background jobs in production\n- Experience running services on AWS"],
            ['company' => 1, 'category' => 'Marketing', 'title' => 'Digital Marketing Specialist', 'mode' => 'hybrid', 'level' => 'mid', 'salary' => [1400, 2000], 'skills' => ['SEO', 'Google Ads', 'Meta Ads', 'Analytics'],
                'description' => "Plan and run paid campaigns across search and social, report weekly on cost per order, and work with the content team on landing pages.",
                'requirements' => "- 2+ years managing paid campaigns with real budgets\n- Comfortable with Google Analytics and spreadsheets\n- Good copywriting in Arabic and English"],
            ['company' => 1, 'category' => 'Customer Support', 'title' => 'Customer Support Agent', 'mode' => 'remote', 'level' => 'junior', 'type' => 'part_time', 'salary' => [500, 750], 'skills' => ['Zendesk', 'Communication', 'Arabic', 'English'],
                'description' => "Help customers with orders, returns and delivery questions over chat and email, four hours a day.",
                'requirements' => "- Friendly, clear writing\n- Reliable internet connection\n- Previous support experience is a plus"],
            ['company' => 1, 'category' => 'Sales', 'title' => 'Marketplace Account Manager', 'mode' => 'onsite', 'level' => 'mid', 'salary' => [1600, 2300], 'skills' => ['Negotiation', 'CRM', 'Account Management'],
                'description' => "Bring new sellers onto the marketplace and help existing ones grow: pricing, catalogue quality and promotions.",
                'requirements' => "- 3+ years in B2B sales or account management\n- Experience with a CRM\n- Comfortable presenting numbers to business owners"],
            ['company' => 1, 'category' => 'Design', 'title' => 'Product Designer', 'mode' => 'hybrid', 'level' => 'mid', 'salary' => [1800, 2600], 'skills' => ['Figma', 'UX Research', 'Design Systems'],
                'description' => "Design the shopping and checkout experience on web and mobile, test ideas with customers, and maintain the component library with the front-end team.",
                'requirements' => "- A portfolio showing shipped product work\n- Strong Figma skills\n- Experience running usability tests"],
            ['company' => 2, 'category' => 'Data & Analytics', 'title' => 'Data Analyst', 'mode' => 'hybrid', 'level' => 'mid', 'salary' => [1300, 1900], 'skills' => ['SQL', 'Power BI', 'Excel', 'Python'],
                'description' => "Turn client data into clear dashboards and short written findings. You will talk to clients directly to understand what they need to decide.",
                'requirements' => "- Strong SQL\n- Experience with Power BI or Tableau\n- Able to explain a chart to a non-technical audience"],
            ['company' => 2, 'category' => 'Data & Analytics', 'title' => 'Data Engineer', 'mode' => 'remote', 'level' => 'senior', 'salary' => [2500, 3500], 'skills' => ['Python', 'SQL', 'Airflow', 'PostgreSQL'],
                'description' => "Build and maintain the pipelines that load client data into our warehouse, and make them reliable enough that nobody has to think about them.",
                'requirements' => "- 4+ years in data engineering\n- Python and SQL at an advanced level\n- Experience with a workflow scheduler"],
            ['company' => 2, 'category' => $dev, 'title' => 'Python Developer Intern', 'mode' => 'onsite', 'level' => 'junior', 'type' => 'internship', 'salary' => [300, 450], 'skills' => ['Python', 'SQL', 'Git'],
                'description' => "A three-month paid internship helping the data team with scripts, data cleaning and internal tools.",
                'requirements' => "- Final-year student or recent graduate\n- Basic Python and SQL\n- Curiosity about data"],
            ['company' => 2, 'category' => 'Sales', 'title' => 'Business Development Representative', 'mode' => 'hybrid', 'level' => 'junior', 'salary' => [900, 1300], 'skills' => ['Prospecting', 'CRM', 'English'],
                'description' => "Find and qualify companies that could use our analytics service, and book first meetings for the consultants.",
                'requirements' => "- Confident on calls and in email\n- Organised follow-up\n- Interest in data and technology"],
            ['company' => 3, 'category' => 'Design', 'title' => 'UI/UX Designer', 'mode' => 'hybrid', 'level' => 'mid', 'salary' => [1200, 1700], 'skills' => ['Figma', 'Prototyping', 'UI Design'],
                'description' => "Design websites and apps for our startup clients, from first wireframes to developer handoff.",
                'requirements' => "- 2+ years of UI/UX work\n- A portfolio with case studies, not only final screens\n- Basic understanding of HTML and CSS"],
            ['company' => 3, 'category' => 'Design', 'title' => 'Graphic Designer', 'mode' => 'onsite', 'level' => 'junior', 'salary' => [600, 900], 'skills' => ['Illustrator', 'Photoshop', 'Branding'],
                'description' => "Create brand identities, social media visuals and print material for clients, working under the art director.",
                'requirements' => "- Portfolio of branding or social media work\n- Adobe Illustrator and Photoshop\n- Good sense of typography"],
            ['company' => 3, 'category' => 'Design', 'title' => 'Motion Designer', 'mode' => 'remote', 'level' => 'mid', 'type' => 'contract', 'salary' => [1000, 1500], 'skills' => ['After Effects', 'Animation', 'Storyboarding'],
                'description' => "A three-month contract producing short product videos and animated logos for two client launches.",
                'requirements' => "- A showreel\n- After Effects\n- Able to work from a brief with little supervision"],
            ['company' => 3, 'category' => 'Marketing', 'title' => 'Content Writer (Arabic & English)', 'mode' => 'remote', 'level' => 'junior', 'type' => 'part_time', 'salary' => [400, 650], 'skills' => ['Copywriting', 'SEO', 'Arabic', 'English'],
                'description' => "Write website copy, case studies and social posts for our clients in both languages.",
                'requirements' => "- Writing samples in Arabic and English\n- Understanding of SEO basics\n- Meets deadlines"],
            ['company' => 4, 'category' => $dev, 'title' => 'Back-End Developer (Laravel)', 'mode' => 'onsite', 'level' => 'mid', 'salary' => [2200, 3000], 'skills' => ['PHP', 'Laravel', 'PostgreSQL', 'Queues', 'Testing'],
                'description' => "Work on the invoicing and payments API used by thousands of small businesses. Correctness matters here: every change ships with tests.",
                'requirements' => "- 3+ years with Laravel\n- Experience with payment integrations\n- Automated testing with Pest or PHPUnit\n- Careful with money, dates and concurrency"],
            ['company' => 4, 'category' => $dev, 'title' => 'QA Engineer', 'mode' => 'hybrid', 'level' => 'mid', 'salary' => [1700, 2400], 'skills' => ['Test Automation', 'Cypress', 'API Testing'],
                'description' => "Own the quality of our web app: write automated end-to-end tests, test new features before release and track down hard-to-reproduce bugs.",
                'requirements' => "- 2+ years in QA\n- Experience with Cypress or Playwright\n- Comfortable testing APIs with Postman"],
            ['company' => 4, 'category' => 'Finance & Accounting', 'title' => 'Financial Analyst', 'mode' => 'onsite', 'level' => 'mid', 'salary' => [2000, 2800], 'skills' => ['Financial Modelling', 'Excel', 'Reporting'],
                'description' => "Prepare monthly reports, build forecasts and support the finance director with pricing analysis.",
                'requirements' => "- Degree in finance or accounting\n- Advanced Excel\n- 2+ years in a similar role"],
            ['company' => 4, 'category' => 'Finance & Accounting', 'title' => 'Accountant', 'mode' => 'onsite', 'level' => 'junior', 'salary' => [1200, 1600], 'skills' => ['Bookkeeping', 'Excel', 'ERP'],
                'description' => "Handle day-to-day bookkeeping, reconciliations and supplier payments.",
                'requirements' => "- Degree in accounting\n- Attention to detail\n- Experience with an accounting system"],
            ['company' => 4, 'category' => 'Human Resources', 'title' => 'HR Generalist', 'mode' => 'onsite', 'level' => 'mid', 'salary' => [1700, 2300], 'skills' => ['Recruitment', 'Onboarding', 'Labour Law'],
                'description' => "Run hiring for non-technical roles, onboard new employees and keep HR records and policies up to date.",
                'requirements' => "- 3+ years in HR\n- Experience running a full hiring process\n- Discreet and well organised"],
            ['company' => 4, 'category' => $dev, 'title' => 'DevOps Engineer', 'mode' => 'remote', 'level' => 'senior', 'salary' => [3000, 4200], 'skills' => ['AWS', 'Docker', 'CI/CD', 'Linux'],
                'description' => "Keep our platform fast and available: infrastructure as code, deployment pipelines, monitoring and on-call improvements.",
                'requirements' => "- 4+ years in DevOps or SRE\n- AWS and Docker in production\n- Experience building CI/CD pipelines"],
            ['company' => 5, 'category' => $dev, 'title' => 'Web Development Instructor', 'mode' => 'remote', 'level' => 'mid', 'type' => 'part_time', 'salary' => [700, 1100], 'skills' => ['JavaScript', 'React', 'Teaching'],
                'description' => "Teach evening classes on JavaScript and React to groups of 15 students, review their projects and answer questions between sessions.",
                'requirements' => "- 3+ years of professional web development\n- Able to explain concepts simply\n- Teaching or mentoring experience is a plus"],
            ['company' => 5, 'category' => 'Marketing', 'title' => 'Social Media Manager', 'mode' => 'remote', 'level' => 'junior', 'salary' => [600, 900], 'skills' => ['Content Planning', 'Canva', 'Community Management'],
                'description' => "Plan and publish content across our channels, reply to students and report on what works.",
                'requirements' => "- Experience managing a brand account\n- Good writing in Arabic\n- Basic design skills"],
            ['company' => 5, 'category' => 'Human Resources', 'title' => 'Talent Acquisition Specialist', 'mode' => 'remote', 'level' => 'mid', 'type' => 'contract', 'salary' => [900, 1300], 'skills' => ['Sourcing', 'Interviewing', 'LinkedIn'],
                'description' => "A six-month contract to hire ten new instructors across programming and design.",
                'requirements' => "- Experience hiring technical people\n- Structured interviewing\n- Good English"],
            ['company' => 5, 'category' => 'Customer Support', 'title' => 'Student Success Coordinator', 'mode' => 'remote', 'level' => 'junior', 'salary' => [550, 800], 'skills' => ['Communication', 'Organisation', 'Arabic'],
                'description' => "Follow up with students through their courses, help them stay on track and collect feedback for the teaching team.",
                'requirements' => "- Empathy and clear communication\n- Organised with spreadsheets and reminders"],
            ['company' => 0, 'category' => $dev, 'title' => 'PHP Developer (WordPress)', 'mode' => 'onsite', 'level' => 'junior', 'salary' => [500, 800], 'skills' => ['PHP', 'WordPress', 'CSS'], 'status' => 'closed',
                'description' => "Maintain and extend a set of WordPress sites for existing clients, including custom themes and plugins.",
                'requirements' => "- PHP and WordPress theme development\n- HTML and CSS"],
        ];
    }

    /** A minimal one-page PDF, enough for the download button to return a real file. */
    private function samplePdf(): string
    {
        return "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            ."2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
            ."3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
            ."4 0 obj<</Length 58>>stream\nBT /F1 18 Tf 72 760 Td (Sample resume - demo data) Tj ET\nendstream endobj\n"
            ."5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
            ."trailer<</Root 1 0 R>>\n%%EOF\n";
    }
}
