import { 
  AreaChart,
  Briefcase, 
  FileText, 
  BookOpen, 
  Play, 
  Clock, 
  CheckCircle, 
  Award, 
  GraduationCap,
  Target 
} from 'lucide-react';

type NavLink = {
  href?: string;
  label: string;
  icon: React.ReactNode;
  children?: Array<NavLink>;
};

const links: Array<NavLink> = [
  {
    href: '/dashboard/metas',
    label: 'Dashboard',
    icon: <AreaChart size={16} />,
  },
  {
    label: 'Candidaturas',
    icon: <Briefcase size={16} />,
    children: [
      {
        href: '/dashboard/candidaturas/stats',
        label: 'Status',
        icon: <AreaChart size={16} />,
      },
      {
        href: '/dashboard/candidaturas/jobs',
        label: 'Minhas Candidaturas',
        icon: <FileText size={16} />,
      },
    ],
  },
  {
    label: 'Faculdade',
    icon: <GraduationCap size={16} />,
    children: [
      {
        href: '/dashboard/faculdade/materias/estatisticas',
        label: 'Estatísticas',
        icon: <AreaChart size={16} />,
      },
      {
        href: '/dashboard/faculdade/provas',
        label: 'Provas e Simulados',
        icon: <FileText size={16} />,
      },
      {
        href: '/dashboard/faculdade/materias',
        label: 'Matérias',
        icon: <BookOpen size={16} />,
        children: [
          {
            href: '/dashboard/faculdade/materias/concluidas',
            label: 'Concluídas',
            icon: <CheckCircle size={16} />,
          },
          {
            href: '/dashboard/faculdade/materias/cursando',
            label: 'Cursando',
            icon: <Play size={16} />,
          },
          {
            href: '/dashboard/faculdade/materias/falta-cursar',
            label: 'Falta Cursar',
            icon: <Clock size={16} />,
          }
        ]
      },
    ],
  },
  {
    href: '/dashboard/cursos',
    label: 'Cursos +',
    icon: <BookOpen size={16} />,
    children: [
      {
        href: '/dashboard/cursos/andamento',
        label: 'Em Andamento',
        icon: <Play size={16} />,
      },
      {
        href: '/dashboard/cursos/pendentes',
        label: 'Em Pendentes',
        icon: <Clock size={16} />,
      },
      {
        href: '/dashboard/cursos/completos',
        label: 'Completos',
        icon: <CheckCircle size={16} />,
      },
      {
        href: '/dashboard/cursos/certificados',
        label: 'Certificados',
        icon: <Award size={16} />,
      }
    ],
  },
  {
    href: '/dashboard/objetivos',
    label: 'Objetivos e Metas',
    icon: <Target size={16} />,
  },
];

export default links;
